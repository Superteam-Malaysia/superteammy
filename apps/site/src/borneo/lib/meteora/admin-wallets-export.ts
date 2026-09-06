import { normalizeTelegramUsername } from "@borneo/lib/auth/telegram";
import {
  formatWalletBalanceForExport,
  fetchWalletBalances,
} from "@borneo/lib/solana/wallet-balances";
import { listMeteoraWalletsForAdmin, type MeteoraWalletRow } from "@borneo/lib/meteora/admin-wallets";

export type MeteoraWalletExportRow = MeteoraWalletRow & {
  telegram: string;
  balance: string;
};

function formatTelegram(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const handle = normalizeTelegramUsername(value);
  return handle ? `@${handle}` : value.trim();
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

export async function listMeteoraWalletsForExport(): Promise<MeteoraWalletExportRow[]> {
  const rows = await listMeteoraWalletsForAdmin();
  if (rows.length === 0) return [];

  return mapWithConcurrency(rows, 4, async (row) => {
    let balance = "";
    try {
      const walletBalances = await fetchWalletBalances(row.solanaWallet);
      balance = formatWalletBalanceForExport(walletBalances);
    } catch {
      balance = "";
    }

    return {
      ...row,
      telegram: formatTelegram(row.telegram),
      balance,
    };
  });
}
