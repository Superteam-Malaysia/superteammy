import type { MeteoraWalletRow } from "@borneo/lib/meteora/admin-wallets";

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

export function AdminMeteoraWalletsTable({ rows }: { rows: MeteoraWalletRow[] }) {
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
            <th scope="col">Locked in</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.participantId}>
              <td>
                <span className="admin-checkin__name">{row.name}</span>
                <span className="admin-submissions-table__email">{row.email}</span>
              </td>
              <td>
                <code className="admin-meteora-wallet" title={row.solanaWallet}>
                  {shortWallet(row.solanaWallet)}
                </code>
              </td>
              <td className="admin-submissions-table__when">{formatWhen(row.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
