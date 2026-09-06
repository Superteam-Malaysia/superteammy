import { solanaRpcCall } from "@borneo/lib/solana/public-rpc";

/** hanstmy.sol — Superteam MY lead wallet for Meteora $25 match. */
export const METEORA_USDC_MATCH_SENDER =
  process.env.METEORA_USDC_MATCH_SENDER?.trim() ||
  "3WNfbFY27KMz98MmQxRBiwS4wh34g3qiW2omQvUq9GyS";

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/** Expected Meteora match size (25 USDC, 6 decimals). */
export const METEORA_USDC_MATCH_AMOUNT = 25_000_000;
const AMOUNT_TOLERANCE = 100_000; // ±0.1 USDC

type SignatureRow = {
  signature: string;
  blockTime: number | null;
  err: unknown;
};

type TokenBalanceRow = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount?: { amount?: string };
};

type ParsedTransaction = {
  meta?: {
    preTokenBalances?: TokenBalanceRow[];
    postTokenBalances?: TokenBalanceRow[];
  } | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Midnight-to-midnight for Asia/Kuching (MYT). */
export function getTodayMytUnixRange(now = new Date()): { start: number; end: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuching",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    const start = Math.floor(now.getTime() / 1000 / 86400) * 86400;
    return { start, end: start + 86400 };
  }

  const start = Math.floor(new Date(`${year}-${month}-${day}T00:00:00+08:00`).getTime() / 1000);
  return { start, end: start + 86400 };
}

function isTargetUsdcAmount(deltaRaw: number): boolean {
  return (
    deltaRaw >= METEORA_USDC_MATCH_AMOUNT - AMOUNT_TOLERANCE &&
    deltaRaw <= METEORA_USDC_MATCH_AMOUNT + AMOUNT_TOLERANCE
  );
}

function recipientsFromTransaction(tx: ParsedTransaction, sender: string): string[] {
  const post = tx.meta?.postTokenBalances ?? [];
  const pre = tx.meta?.preTokenBalances ?? [];
  const found: string[] = [];

  for (const postRow of post) {
    if (postRow.mint !== USDC_MINT) continue;

    const preRow = pre.find(
      (row) => row.accountIndex === postRow.accountIndex && row.mint === USDC_MINT,
    );
    const preAmount = Number(preRow?.uiTokenAmount?.amount ?? 0);
    const postAmount = Number(postRow.uiTokenAmount?.amount ?? 0);
    const delta = postAmount - preAmount;

    if (!Number.isFinite(delta) || !isTargetUsdcAmount(delta)) continue;

    const owner = postRow.owner?.trim();
    if (!owner || owner === sender) continue;
    found.push(owner);
  }

  return found;
}

async function fetchSenderSignaturesForToday(sender: string): Promise<SignatureRow[]> {
  const { start, end } = getTodayMytUnixRange();
  const rows: SignatureRow[] = [];
  let before: string | undefined;

  for (let page = 0; page < 10; page++) {
    const options: { limit: number; before?: string } = { limit: 1000 };
    if (before) options.before = before;

    const batch = await solanaRpcCall<SignatureRow[]>("getSignaturesForAddress", [
      sender,
      options,
    ]);

    if (batch.length === 0) break;

    let reachedOlder = false;
    for (const row of batch) {
      if (row.err) continue;
      if (!row.blockTime) continue;
      if (row.blockTime >= end) continue;
      if (row.blockTime < start) {
        reachedOlder = true;
        break;
      }
      rows.push(row);
    }

    if (reachedOlder || batch.length < 1000) break;
    before = batch[batch.length - 1]?.signature;
    if (!before) break;
  }

  return rows;
}

/** Wallets that received ~25 USDC from hanstmy.sol today (MYT). */
export async function fetchMeteoraUsdcMatchRecipientsToday(): Promise<Set<string>> {
  const sender = METEORA_USDC_MATCH_SENDER;
  const recipients = new Set<string>();

  let signatures: SignatureRow[];
  try {
    signatures = await fetchSenderSignaturesForToday(sender);
  } catch {
    return recipients;
  }

  for (const [index, row] of signatures.entries()) {
    try {
      const tx = await solanaRpcCall<ParsedTransaction | null>("getTransaction", [
        row.signature,
        { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" },
      ]);
      if (!tx) continue;

      for (const wallet of recipientsFromTransaction(tx, sender)) {
        recipients.add(wallet);
      }
    } catch {
      /* skip failed tx fetch */
    }

    if (index < signatures.length - 1) {
      await sleep(120);
    }
  }

  return recipients;
}

export function walletReceivedMeteoraUsdcMatch(
  wallet: string,
  recipients: Set<string>,
): boolean {
  return recipients.has(wallet.trim());
}
