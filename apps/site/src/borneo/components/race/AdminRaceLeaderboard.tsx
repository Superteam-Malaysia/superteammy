import type { RaceLeaderboardRow } from "@borneo/lib/race/leaderboard";

export function AdminRaceLeaderboard({ rows }: { rows: RaceLeaderboardRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-[color:var(--color-transparent-wisp-55)]">
        No scored submissions yet — teams appear here once milestone links are logged.
      </p>
    );
  }

  return (
    <div className="admin-submissions-table-wrap">
      <table className="admin-submissions-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Race team</th>
            <th scope="col">Pts</th>
            <th scope="col">Milestones</th>
            <th scope="col">Members</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.groupLabel}-${row.rank}`}>
              <td className="font-[family-name:var(--font-mono)] font-bold text-[var(--color-wisp)]">
                {row.rank}
              </td>
              <td>
                <span className="font-medium text-[var(--color-wisp)]">{row.groupLabel}</span>
                {row.groupNumber != null ? (
                  <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-xs text-[color:var(--color-transparent-wisp-55)]">
                    Group {row.groupNumber}
                  </span>
                ) : null}
              </td>
              <td className="font-[family-name:var(--font-display)] text-lg font-extrabold text-[var(--color-wisp)]">
                {row.points}
              </td>
              <td className="font-[family-name:var(--font-mono)] text-[color:var(--color-transparent-wisp-78)]">
                {row.milestoneCount}
              </td>
              <td className="text-sm text-[color:var(--color-transparent-wisp-72)]">
                {row.members.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
