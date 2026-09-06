const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";
const RPC_TIMEOUT_MS = 30_000;
const RPC_MAX_RETRIES = 4;

export function solanaPublicRpcUrl(): string {
  const override = process.env.SOLANA_RPC_URL?.trim();
  return override || DEFAULT_RPC;
}

function isRetryableRpcError(message: string, httpStatus: number): boolean {
  const lower = message.toLowerCase();
  return (
    httpStatus === 429 ||
    httpStatus === 502 ||
    httpStatus === 503 ||
    httpStatus === 504 ||
    lower.includes("too many") ||
    lower.includes("rate limit") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("fetch failed") ||
    lower.includes("network") ||
    lower.includes("503") ||
    lower.includes("429")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function solanaRpcCallOnce<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(solanaPublicRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
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

export async function solanaRpcCall<T>(method: string, params: unknown[]): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RPC_MAX_RETRIES; attempt++) {
    try {
      return await solanaRpcCallOnce<T>(method, params);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;

      const httpStatus = Number(err.message.match(/HTTP (\d{3})/)?.[1] ?? 0);
      if (attempt >= RPC_MAX_RETRIES - 1 || !isRetryableRpcError(err.message, httpStatus)) {
        throw err;
      }

      await sleep(400 * 2 ** attempt);
    }
  }

  throw lastError ?? new Error("Solana RPC failed");
}
