export type JupiterToken = {
  id: string;
  name: string;
  symbol: string;
  icon: string | null;
  usdPrice: number | null;
};

const JUPITER_SEARCH_BASE = "https://lite-api.jup.ag/tokens/v2/search";
const SEARCH_CHUNK = 100;

async function jupiterSearch(query: string): Promise<JupiterToken[]> {
  const res = await fetch(`${JUPITER_SEARCH_BASE}?query=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json", "User-Agent": "superteammy-borneo/1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    throw new Error(`Jupiter tokens HTTP ${res.status}`);
  }

  const rows = (await res.json()) as Array<{
    id?: string;
    name?: string;
    symbol?: string;
    icon?: string;
    usdPrice?: number;
  }>;

  return rows
    .filter((row): row is typeof row & { id: string } => Boolean(row.id))
    .map((row) => ({
      id: row.id,
      name: row.name?.trim() || row.symbol?.trim() || row.id,
      symbol: row.symbol?.trim() || row.id.slice(0, 4),
      icon: row.icon?.trim() || null,
      usdPrice: typeof row.usdPrice === "number" && Number.isFinite(row.usdPrice) ? row.usdPrice : null,
    }));
}

/** Batch mint lookup — Jupiter accepts comma-separated mint addresses (max 100). */
export async function fetchJupiterTokensByMints(mints: string[]): Promise<Map<string, JupiterToken>> {
  const unique = [...new Set(mints.filter(Boolean))];
  const byMint = new Map<string, JupiterToken>();
  if (unique.length === 0) return byMint;

  for (let i = 0; i < unique.length; i += SEARCH_CHUNK) {
    const chunk = unique.slice(i, i + SEARCH_CHUNK);
    let rows: JupiterToken[];
    try {
      rows = await jupiterSearch(chunk.join(","));
    } catch {
      continue;
    }
    for (const row of rows) {
      byMint.set(row.id, row);
    }
  }

  return byMint;
}
