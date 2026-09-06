import { TOKENS_XYZ_API_BASE, TOKENS_XYZ_API_KEY } from "@borneo/lib/tokens-xyz/constants";

export type TokensMarketToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price?: number;
  logoURI?: string;
};

export type TokensMarketSnapshot = {
  address: string;
  token: TokensMarketToken | null;
  hasMarket: boolean;
};

type ResolveResponse = {
  assetId?: string;
  asset?: {
    assetId?: string;
    name?: string | null;
    symbol?: string | null;
    imageUrl?: string | null;
    symbols?: string[];
  };
};

type AssetDetailResponse = {
  asset?: {
    assetId?: string;
    name?: string | null;
    symbol?: string | null;
    imageUrl?: string | null;
    symbols?: string[];
    stats?: { price?: number | null } | null;
    primaryVariant?: {
      symbol?: string | null;
      name?: string | null;
      market?: { price?: number | null; logoURI?: string | null } | null;
    } | null;
  };
};

async function tokensFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${TOKENS_XYZ_API_BASE}${path}`, {
    ...init,
    headers: {
      "x-api-key": TOKENS_XYZ_API_KEY,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    throw new Error(`Tokens.xyz HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

const SNAPSHOT_CHUNK = 250;

export async function fetchMarketSnapshots(mints: string[]): Promise<Map<string, TokensMarketSnapshot>> {
  const unique = [...new Set(mints.filter(Boolean))];
  const byMint = new Map<string, TokensMarketSnapshot>();
  if (unique.length === 0) return byMint;

  for (let i = 0; i < unique.length; i += SNAPSHOT_CHUNK) {
    const chunk = unique.slice(i, i + SNAPSHOT_CHUNK);
    try {
      const rows = await tokensFetch<TokensMarketSnapshot[]>("/assets/market-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mints: chunk }),
      });

      for (const row of rows) {
        byMint.set(row.address, row);
      }
    } catch {
      // Best-effort — Jupiter fallback handles missing rows.
    }
  }

  return byMint;
}

function pickSymbol(asset: NonNullable<ResolveResponse["asset"]>): string | null {
  if (asset.symbol?.trim()) return asset.symbol.trim();
  const fromList = asset.symbols?.find((value) => value?.trim());
  return fromList?.trim() ?? null;
}

export async function resolveMintAsset(mint: string): Promise<{
  assetId: string | null;
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  price: number | null;
}> {
  try {
    const data = await tokensFetch<ResolveResponse>(
      `/assets/resolve?mint=${encodeURIComponent(mint)}`,
    );
    const asset = data.asset;
    let name = asset?.name?.trim() || null;
    let symbol = asset ? pickSymbol(asset) : null;
    let imageUrl = asset?.imageUrl ?? null;
    let price: number | null = null;

    const assetId = data.assetId ?? asset?.assetId ?? null;
    if ((!name || !symbol || !imageUrl) && assetId) {
      try {
        const detail = await tokensFetch<AssetDetailResponse>(
          `/assets/${encodeURIComponent(assetId)}?mint=${encodeURIComponent(mint)}`,
        );
        const detailAsset = detail.asset;
        name = name ?? detailAsset?.name?.trim() ?? detailAsset?.primaryVariant?.name?.trim() ?? null;
        symbol =
          symbol ??
          detailAsset?.symbol?.trim() ??
          (detailAsset ? pickSymbol(detailAsset) : null) ??
          detailAsset?.primaryVariant?.symbol?.trim() ??
          null;
        imageUrl = imageUrl ?? detailAsset?.imageUrl ?? detailAsset?.primaryVariant?.market?.logoURI ?? null;
        const detailPrice =
          detailAsset?.stats?.price ?? detailAsset?.primaryVariant?.market?.price ?? null;
        if (typeof detailPrice === "number" && Number.isFinite(detailPrice)) {
          price = detailPrice;
        }
      } catch {
        // Resolve detail is best-effort.
      }
    }

    return { assetId, name, symbol, imageUrl, price };
  } catch {
    return { assetId: null, name: null, symbol: null, imageUrl: null, price: null };
  }
}
