import { normalizeTelegramUsername } from "@borneo/lib/auth/telegram";
import { fetchWalletTotalsForExport } from "@borneo/lib/solana/wallet-balances";
import {
  listMeteoraWalletsForAdmin,
  type MeteoraWalletRow,
} from "@borneo/lib/meteora/admin-wallets";

export type MeteoraWalletAdminRow = MeteoraWalletRow & {
  balanceUsd: number;
};

export type MeteoraWalletExportRow = MeteoraWalletRow & {
  telegram: string;
  balance: string;
};

function formatTelegram(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const handle = normalizeTelegramUsername(value);
  return handle ? `@${handle}` : value.trim();
}

export async function listMeteoraWalletsWithBalancesForAdmin(): Promise<MeteoraWalletAdminRow[]> {
  const rows = await listMeteoraWalletsForAdmin();
  if (rows.length === 0) return [];

  const totals = await fetchWalletTotalsForExport(rows.map((row) => row.solanaWallet));

  return rows.map((row) => ({
    ...row,
    balanceUsd: totals.get(row.solanaWallet) ?? 0,
  }));
}

export async function listMeteoraWalletsForExport(): Promise<MeteoraWalletExportRow[]> {
  const rows = await listMeteoraWalletsWithBalancesForAdmin();

  return rows.map((row) => ({
    ...row,
    telegram: formatTelegram(row.telegram),
    balance: row.balanceUsd.toFixed(2),
  }));
}
