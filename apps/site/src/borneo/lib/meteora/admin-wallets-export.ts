import { normalizeTelegramUsername } from "@borneo/lib/auth/telegram";
import { fetchWalletTotalsForExport } from "@borneo/lib/solana/wallet-balances";
import {
  fetchMeteoraUsdcMatchRecipientsToday,
  walletReceivedMeteoraUsdcMatch,
} from "@borneo/lib/meteora/usdc-match-check";
import {
  listMeteoraWalletsForAdmin,
  type MeteoraWalletRow,
} from "@borneo/lib/meteora/admin-wallets";

export type MeteoraWalletAdminRow = MeteoraWalletRow & {
  balanceUsd: number;
  receivedMatchUsdcToday: boolean;
};

export type MeteoraWalletExportRow = MeteoraWalletRow & {
  telegram: string;
  balance: string;
  receivedMatchUsdcToday: string;
};

function formatTelegram(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const handle = normalizeTelegramUsername(value);
  return handle ? `@${handle}` : value.trim();
}

export async function listMeteoraWalletsWithBalancesForAdmin(): Promise<MeteoraWalletAdminRow[]> {
  const rows = await listMeteoraWalletsForAdmin();
  if (rows.length === 0) return [];

  const [totals, matchRecipients] = await Promise.all([
    fetchWalletTotalsForExport(rows.map((row) => row.solanaWallet)),
    fetchMeteoraUsdcMatchRecipientsToday(),
  ]);

  return rows.map((row) => ({
    ...row,
    balanceUsd: totals.get(row.solanaWallet) ?? 0,
    receivedMatchUsdcToday: walletReceivedMeteoraUsdcMatch(row.solanaWallet, matchRecipients),
  }));
}

export async function listMeteoraWalletsForExport(): Promise<MeteoraWalletExportRow[]> {
  const rows = await listMeteoraWalletsWithBalancesForAdmin();

  return rows.map((row) => ({
    ...row,
    telegram: formatTelegram(row.telegram),
    balance: row.balanceUsd.toFixed(2),
    receivedMatchUsdcToday: row.receivedMatchUsdcToday ? "yes" : "no",
  }));
}
