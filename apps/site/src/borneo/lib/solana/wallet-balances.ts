import { fetchJupiterTokensByMints, type JupiterToken } from "@borneo/lib/jupiter/token-search";
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
  price: number | null;
};

function snapshotForMint(
  mint: string | null,
  snapshots: Map<string, TokensMarketSnapshot>,
): TokensMarketSnapshot | undefined {
  return snapshots.get(mint ?? WSOL_MINT);
}

function snapshotHasMetadata(snapshot: TokensMarketSnapshot | undefined): boolean {
  const token = snapshot?.token;
  return Boolean(token?.symbol?.trim() && token?.name?.trim());
}

function buildBalanceRow(
  raw: RawBalance,
  snapshots: Map<string, TokensMarketSnapshot>,
  resolvedByMint: Map<string, ResolvedMintMeta>,
  jupiterByMint: Map<string, JupiterToken>,
): WalletBalanceRow {
  const snapshot = snapshotForMint(raw.mint, snapshots);
  const xyzToken = snapshot?.token ?? null;
  const resolved = raw.mint ? resolvedByMint.get(raw.mint) : null;
  const jupiter = raw.mint ? jupiterByMint.get(raw.mint) : jupiterByMint.get(WSOL_MINT);

  const name =
    raw.mint === null
      ? (xyzToken?.name ?? jupiter?.name ?? resolved?.name ?? "Solana")
      : (xyzToken?.name ?? jupiter?.name ?? resolved?.name ?? shortMint(raw.mint));
  const symbol =
    raw.mint === null
      ? (xyzToken?.symbol ?? jupiter?.symbol ?? resolved?.symbol ?? "SOL")
      : (xyzToken?.symbol ?? jupiter?.symbol ?? resolved?.symbol ?? shortMint(raw.mint));
  const logoUrl = xyzToken?.logoURI ?? jupiter?.icon ?? resolved?.imageUrl ?? null;
  const assetId = resolved?.assetId ?? null;

  const price =
    xyzToken?.price ??
    resolved?.price ??
    jupiter?.usdPrice ??
    null;

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

function balanceSortValue(
  raw: RawBalance,
  snapshots: Map<string, TokensMarketSnapshot>,
  resolvedByMint: Map<string, ResolvedMintMeta>,
  jupiterByMint: Map<string, JupiterToken>,
): number {
  const snapshot = snapshotForMint(raw.mint, snapshots);
  const resolved = raw.mint ? resolvedByMint.get(raw.mint) : null;
  const jupiter = raw.mint ? jupiterByMint.get(raw.mint) : jupiterByMint.get(WSOL_MINT);
  const price = snapshot?.token?.price ?? resolved?.price ?? jupiter?.usdPrice ?? null;
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

  const splMints = rawBalances
    .map((row) => row.mint)
    .filter((mint): mint is string => Boolean(mint));

  const mintsForLookup = [WSOL_MINT, ...splMints];
  const snapshots = await fetchMarketSnapshots(mintsForLookup);

  const mintsNeedingResolve = [
    ...new Set(
      splMints.filter((mint) => !snapshotHasMetadata(snapshots.get(mint))),
    ),
  ];

  const [resolvedEntries, jupiterByMint] = await Promise.all([
    Promise.all(
      mintsNeedingResolve.map(async (mint) => [mint, await resolveMintAsset(mint)] as const),
    ),
    fetchJupiterTokensByMints(mintsForLookup),
  ]);

  const resolvedByMint = new Map<string, ResolvedMintMeta>(resolvedEntries);

  const rowsWithRaw = rawBalances.map((raw) => ({
    raw,
    row: buildBalanceRow(raw, snapshots, resolvedByMint, jupiterByMint),
  }));

  rowsWithRaw.sort((a, b) => {
    const valueDiff =
      balanceSortValue(b.raw, snapshots, resolvedByMint, jupiterByMint) -
      balanceSortValue(a.raw, snapshots, resolvedByMint, jupiterByMint);
    if (valueDiff !== 0) return valueDiff;
    if (a.raw.mint === null) return -1;
    if (b.raw.mint === null) return 1;
    return a.row.symbol.localeCompare(b.row.symbol);
  });

  return { address, balances: rowsWithRaw.map(({ row }) => row) };
}
