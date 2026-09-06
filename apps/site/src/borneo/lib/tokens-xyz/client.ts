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
    name?: string;
    symbol?: string;
    imageUrl?: string | null;
  };
};

async function tokensFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${TOKENS_XYZ_API_BASE}${path}`, {
    ...init,
    headers: {
      "x-api-key": TOKENS_XYZ_API_KEY,
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
    const rows = await tokensFetch<TokensMarketSnapshot[]>("/assets/market-snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mints: chunk }),
    });

    for (const row of rows) {
      byMint.set(row.address, row);
    }
  }

  return byMint;
}

export async function resolveMintAsset(mint: string): Promise<{
  assetId: string | null;
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
}> {
  try {
    const data = await tokensFetch<ResolveResponse>(
      `/assets/resolve?mint=${encodeURIComponent(mint)}`,
    );
    const asset = data.asset;
    return {
      assetId: data.assetId ?? asset?.assetId ?? null,
      name: asset?.name ?? null,
      symbol: asset?.symbol ?? null,
      imageUrl: asset?.imageUrl ?? null,
    };
  } catch {
    return { assetId: null, name: null, symbol: null, imageUrl: null };
  }
}
