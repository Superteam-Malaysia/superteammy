/** Solana addresses are base58, typically 32–44 chars. */
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function normalizeSolanaWallet(value: string): string {
  return value.trim();
}

export function isValidSolanaWallet(value: string): boolean {
  const wallet = normalizeSolanaWallet(value);
  return BASE58_RE.test(wallet);
}
