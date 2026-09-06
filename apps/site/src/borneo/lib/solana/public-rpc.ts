const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export function solanaPublicRpcUrl(): string {
  const override = process.env.SOLANA_RPC_URL?.trim();
  return override || DEFAULT_RPC;
}

export async function solanaRpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(solanaPublicRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    throw new Error(`Solana RPC HTTP ${res.status}`);
  }

  const payload = (await res.json()) as { result?: T; error?: { message?: string } };
  if (payload.error) {
    throw new Error(payload.error.message ?? "Solana RPC error");
  }
  if (payload.result === undefined) {
    throw new Error("Solana RPC returned no result");
  }

  return payload.result;
}
