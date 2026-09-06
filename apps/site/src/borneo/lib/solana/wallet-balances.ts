import { fetchJupiterTokensByMints, type JupiterToken } from "@borneo/lib/jupiter/token-search";
import { isValidSolanaWallet } from "@borneo/lib/profile/wallet";
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
  /** Sum of current USD value across all priced holdings. */
  totalUsd: number;
};

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

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

type PriceContext = {
  snapshots: Map<string, TokensMarketSnapshot>;
  resolvedByMint: Map<string, ResolvedMintMeta>;
  jupiterByMint: Map<string, JupiterToken>;
};

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

function mintHasPrice(
  mint: string,
  snapshots: Map<string, TokensMarketSnapshot>,
  jupiterByMint: Map<string, JupiterToken>,
): boolean {
  const snapshot = snapshots.get(mint);
  if (typeof snapshot?.token?.price === "number" && Number.isFinite(snapshot.token.price)) {
    return true;
  }
  const jupiter = jupiterByMint.get(mint);
  return typeof jupiter?.usdPrice === "number" && Number.isFinite(jupiter.usdPrice);
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

function sumRawBalancesUsd(rawBalances: RawBalance[], ctx: PriceContext): number {
  return rawBalances.reduce(
    (sum, raw) =>
      sum + balanceSortValue(raw, ctx.snapshots, ctx.resolvedByMint, ctx.jupiterByMint),
    0,
  );
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

  const price = xyzToken?.price ?? resolved?.price ?? jupiter?.usdPrice ?? null;
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

async function fetchRawHoldings(address: string): Promise<RawBalance[]> {
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

  return rawBalances;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function resolveMintsBatch(mints: string[], concurrency = 4): Promise<Map<string, ResolvedMintMeta>> {
  const resolvedByMint = new Map<string, ResolvedMintMeta>();
  if (mints.length === 0) return resolvedByMint;

  const entries = await mapWithConcurrency(mints, concurrency, async (mint) => {
    const resolved = await resolveMintAsset(mint);
    return [mint, resolved] as const;
  });

  for (const [mint, resolved] of entries) {
    resolvedByMint.set(mint, resolved);
  }

  return resolvedByMint;
}

async function buildPriceContext(allSplMints: Set<string>): Promise<PriceContext> {
  const mintsForLookup = [WSOL_MINT, ...allSplMints];
  const snapshots = await fetchMarketSnapshots(mintsForLookup);
  const jupiterByMint = await fetchJupiterTokensByMints(mintsForLookup);

  const mintsNeedingResolve = [...allSplMints].filter(
    (mint) => !mintHasPrice(mint, snapshots, jupiterByMint),
  );
  const resolvedByMint = await resolveMintsBatch(mintsNeedingResolve, 4);

  return { snapshots, jupiterByMint, resolvedByMint };
}

function walletBalancesFromRaw(address: string, rawBalances: RawBalance[], ctx: PriceContext): WalletBalances {
  const rowsWithRaw = rawBalances.map((raw) => ({
    raw,
    row: buildBalanceRow(raw, ctx.snapshots, ctx.resolvedByMint, ctx.jupiterByMint),
  }));

  rowsWithRaw.sort((a, b) => {
    const valueDiff =
      balanceSortValue(b.raw, ctx.snapshots, ctx.resolvedByMint, ctx.jupiterByMint) -
      balanceSortValue(a.raw, ctx.snapshots, ctx.resolvedByMint, ctx.jupiterByMint);
    if (valueDiff !== 0) return valueDiff;
    if (a.raw.mint === null) return -1;
    if (b.raw.mint === null) return 1;
    return a.row.symbol.localeCompare(b.row.symbol);
  });

  return {
    address,
    balances: rowsWithRaw.map(({ row }) => row),
    totalUsd: sumRawBalancesUsd(rawBalances, ctx),
  };
}

/** Bulk export — batch price lookups and fetch holdings sequentially with RPC retries. */
export async function fetchWalletTotalsForExport(addresses: string[]): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  const uniqueAddresses = [...new Set(addresses.map((address) => address.trim()).filter(Boolean))];
  if (uniqueAddresses.length === 0) return totals;

  const holdingsByAddress = new Map<string, RawBalance[]>();
  const allSplMints = new Set<string>();

  for (const address of uniqueAddresses) {
    if (!isValidSolanaWallet(address)) {
      holdingsByAddress.set(address, []);
      totals.set(address, 0);
      continue;
    }

    try {
      const raw = await fetchRawHoldings(address);
      holdingsByAddress.set(address, raw);
      for (const row of raw) {
        if (row.mint) allSplMints.add(row.mint);
      }
    } catch {
      holdingsByAddress.set(address, []);
      totals.set(address, 0);
    }

    // Pace RPC calls during bulk export.
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const ctx = await buildPriceContext(allSplMints);

  for (const address of uniqueAddresses) {
    if (totals.has(address)) continue;
    const raw = holdingsByAddress.get(address) ?? [];
    totals.set(address, sumRawBalancesUsd(raw, ctx));
  }

  return totals;
}

export async function fetchWalletBalances(address: string): Promise<WalletBalances> {
  const rawBalances = await fetchRawHoldings(address);

  const splMints = rawBalances
    .map((row) => row.mint)
    .filter((mint): mint is string => Boolean(mint));

  const ctx = await buildPriceContext(new Set(splMints));
  return walletBalancesFromRaw(address, rawBalances, ctx);
}

/** Total USD for CSV export — sum of every priced token in the wallet. */
export function formatWalletBalanceForExport(balances: WalletBalances | null): string {
  if (!balances) return "0.00";
  return balances.totalUsd.toFixed(2);
}
