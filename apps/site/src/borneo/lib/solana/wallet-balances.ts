import {
  fetchMarketSnapshots,
  resolveMintAsset,
  type TokensMarketSnapshot,
} from "@borneo/lib/tokens-xyz/client";
import { WSOL_MINT } from "@borneo/lib/tokens-xyz/constants";
import { solanaRpcCall } from "@borneo/lib/solana/public-rpc";

export type WalletBalanceRow = {
  symbol: string;
  name: string;
  amount: string;
  valueUsd: string | null;
  mint: string | null;
  logoUrl: string | null;
  assetId: string | null;
};

export type WalletBalances = {
  address: string;
  balances: WalletBalanceRow[];
};

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return value.toLocaleString(undefined, { maximumSignificantDigits: 4 });
}

function formatSol(lamports: number): string {
  return formatTokenAmount(lamports / 1_000_000_000);
}

function formatUsd(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1) {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
  });
}

function shortMint(mint: string): string {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

type TokenAccountResult = {
  account: {
    data: {
      parsed?: {
        info?: {
          mint?: string;
          tokenAmount?: {
            uiAmount?: number | null;
            uiAmountString?: string;
          };
        };
      };
    };
  };
};

type RawBalance = {
  mint: string | null;
  amount: number;
};

type ResolvedMintMeta = {
  assetId: string | null;
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
};

function snapshotForMint(
  mint: string | null,
  snapshots: Map<string, TokensMarketSnapshot>,
): TokensMarketSnapshot | undefined {
  return snapshots.get(mint ?? WSOL_MINT);
}

function buildBalanceRow(
  raw: RawBalance,
  snapshots: Map<string, TokensMarketSnapshot>,
  resolvedByMint: Map<string, ResolvedMintMeta>,
): WalletBalanceRow {
  const snapshot = snapshotForMint(raw.mint, snapshots);
  const token = snapshot?.token ?? null;
  const resolved = raw.mint ? resolvedByMint.get(raw.mint) : null;

  const name =
    raw.mint === null
      ? (token?.name ?? "Solana")
      : (token?.name ?? resolved?.name ?? shortMint(raw.mint));
  const symbol =
    raw.mint === null
      ? (token?.symbol ?? "SOL")
      : (token?.symbol ?? resolved?.symbol ?? shortMint(raw.mint));
  const logoUrl = token?.logoURI ?? resolved?.imageUrl ?? null;
  const assetId = resolved?.assetId ?? null;
  const price = token?.price ?? null;
  const units = raw.mint === null ? raw.amount / 1_000_000_000 : raw.amount;
  const valueUsd =
    price != null && Number.isFinite(price) ? formatUsd(units * price) : null;

  return {
    symbol,
    name,
    amount: raw.mint === null ? formatSol(raw.amount) : formatTokenAmount(raw.amount),
    valueUsd,
    mint: raw.mint,
    logoUrl,
    assetId,
  };
}

function balanceSortValue(raw: RawBalance, snapshots: Map<string, TokensMarketSnapshot>): number {
  const token = snapshotForMint(raw.mint, snapshots)?.token;
  const price = token?.price;
  if (price == null || !Number.isFinite(price)) return 0;
  const units = raw.mint === null ? raw.amount / 1_000_000_000 : raw.amount;
  return units * price;
}

export async function fetchWalletBalances(address: string): Promise<WalletBalances> {
  const [lamports, tokenAccounts] = await Promise.all([
    solanaRpcCall<number>("getBalance", [address]),
    solanaRpcCall<{ value: TokenAccountResult[] }>("getTokenAccountsByOwner", [
      address,
      { programId: TOKEN_PROGRAM },
      { encoding: "jsonParsed" },
    ]),
  ]);

  const rawBalances: RawBalance[] = [];

  if (lamports > 0) {
    rawBalances.push({ mint: null, amount: lamports });
  }

  for (const entry of tokenAccounts.value) {
    const info = entry.account.data.parsed?.info;
    const mint = info?.mint?.trim();
    const uiAmount = info?.tokenAmount?.uiAmount;
    const uiAmountString = info?.tokenAmount?.uiAmountString;
    const amount =
      typeof uiAmount === "number"
        ? uiAmount
        : uiAmountString
          ? Number(uiAmountString)
          : NaN;
    if (!mint || !Number.isFinite(amount) || amount === 0) continue;
    rawBalances.push({ mint, amount });
  }

  const mintsForSnapshots = [
    WSOL_MINT,
    ...rawBalances.map((row) => row.mint).filter((mint): mint is string => Boolean(mint)),
  ];
  const snapshots = await fetchMarketSnapshots(mintsForSnapshots);

  const mintsNeedingResolve = [
    ...new Set(
      rawBalances
        .map((row) => row.mint)
        .filter((mint): mint is string => Boolean(mint))
        .filter((mint) => !snapshots.get(mint)?.token),
    ),
  ];

  const resolvedEntries = await Promise.all(
    mintsNeedingResolve.map(async (mint) => [mint, await resolveMintAsset(mint)] as const),
  );
  const resolvedByMint = new Map<string, ResolvedMintMeta>(resolvedEntries);

  const rowsWithRaw = rawBalances.map((raw) => ({
    raw,
    row: buildBalanceRow(raw, snapshots, resolvedByMint),
  }));

  rowsWithRaw.sort((a, b) => {
    const valueDiff = balanceSortValue(b.raw, snapshots) - balanceSortValue(a.raw, snapshots);
    if (valueDiff !== 0) return valueDiff;
    if (a.raw.mint === null) return -1;
    if (b.raw.mint === null) return 1;
    return a.row.symbol.localeCompare(b.row.symbol);
  });

  return { address, balances: rowsWithRaw.map(({ row }) => row) };
}
