"use client";

import { useEffect, useState } from "react";
import { CopyWalletButton } from "@borneo/components/admin/CopyWalletButton";
import type { MeteoraWalletAdminRow } from "@borneo/lib/meteora/admin-wallets-export";
import { withBasePath } from "@borneo/lib/base-path";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-MY", {
    timeZone: "Asia/Kuching",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortWallet(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

function formatBalanceUsd(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTelegram(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("@")) return trimmed;
  const match = trimmed.match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([^/?#]+)/i);
  if (match?.[1]) return `@${match[1]}`;
  return trimmed;
}

type WalletsResponse = {
  wallets?: MeteoraWalletAdminRow[];
  error?: string;
};

export function AdminMeteoraWalletsTable() {
  const [rows, setRows] = useState<MeteoraWalletAdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(withBasePath("/api/admin/meteora/wallets"), {
          credentials: "same-origin",
          cache: "no-store",
        });
        const data = (await res.json()) as WalletsResponse;

        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Could not load wallets.");
          return;
        }

        if (!cancelled) setRows(data.wallets ?? []);
      } catch {
        if (!cancelled) setError("Could not load wallets.");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="admin-hub__empty">{error}</p>;
  }

  if (!rows) {
    return (
      <p className="admin-hub__empty" aria-live="polite">
        Loading wallets and live balances…
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="admin-hub__empty">No wallets locked in yet.</p>;
  }

  return (
    <div className="admin-submissions-table-wrap">
      <table className="admin-submissions-table">
        <thead>
          <tr>
            <th scope="col">Participant</th>
            <th scope="col">Wallet</th>
            <th scope="col">Balance</th>
            <th scope="col">$25 match</th>
            <th scope="col">Locked in</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.participantId}>
              <td>
                <span className="admin-checkin__name">{row.name}</span>
                <span className="admin-submissions-table__email">{row.email}</span>
                {row.telegram ? (
                  <span className="admin-submissions-table__email">{formatTelegram(row.telegram)}</span>
                ) : null}
              </td>
              <td>
                <div className="admin-meteora-wallet-cell">
                  <code className="admin-meteora-wallet" title={row.solanaWallet}>
                    {shortWallet(row.solanaWallet)}
                  </code>
                  <CopyWalletButton address={row.solanaWallet} />
                </div>
              </td>
              <td className="admin-meteora-balance">{formatBalanceUsd(row.balanceUsd)}</td>
              <td>
                <span
                  className={
                    row.receivedMatchUsdcToday
                      ? "admin-meteora-match admin-meteora-match--yes"
                      : "admin-meteora-match admin-meteora-match--no"
                  }
                >
                  {row.receivedMatchUsdcToday ? "Received" : "Not yet"}
                </span>
              </td>
              <td className="admin-submissions-table__when">{formatWhen(row.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
