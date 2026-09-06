import Link from "@borneo/components/Link";
import type { RaceLeaderboardRow } from "@borneo/lib/race/leaderboard";
import type { AdminRaceSubmission } from "@borneo/lib/race/submissions";
import { withBasePath } from "@borneo/lib/base-path";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuching",
  });
}

function sortSubmissions(
  submissions: AdminRaceSubmission[],
  leaderboard: RaceLeaderboardRow[],
): AdminRaceSubmission[] {
  const rankByGroup = new Map(leaderboard.map((row) => [row.groupLabel, row.rank]));

  return [...submissions].sort((a, b) => {
    const aRank = a.raceGroupLabel ? rankByGroup.get(a.raceGroupLabel) ?? 999 : 999;
    const bRank = b.raceGroupLabel ? rankByGroup.get(b.raceGroupLabel) ?? 999 : 999;
    if (aRank !== bRank) return aRank - bRank;

    const aGroup = a.raceGroupLabel ?? `Solo · ${a.submitterName ?? ""}`;
    const bGroup = b.raceGroupLabel ?? `Solo · ${b.submitterName ?? ""}`;
    if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);

    if (a.taskNumber !== b.taskNumber) return a.taskNumber - b.taskNumber;
    return (a.submitterName ?? "").localeCompare(b.submitterName ?? "");
  });
}

function groupSubmissions(submissions: AdminRaceSubmission[]) {
  const groups: { label: string; rows: AdminRaceSubmission[] }[] = [];
  let currentLabel: string | null = null;

  for (const row of submissions) {
    const label = row.raceGroupLabel ?? `Solo · ${row.submitterName ?? "Unknown"}`;
    if (label !== currentLabel) {
      groups.push({ label, rows: [row] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].rows.push(row);
    }
  }

  return groups;
}

export function AdminSubmissionsTable({
  submissions,
  leaderboard = [],
}: {
  submissions: AdminRaceSubmission[];
  leaderboard?: RaceLeaderboardRow[];
}) {
  if (!submissions.length) {
    return (
      <p className="text-sm text-[var(--color-wisp)]/60">
        No race thread submissions yet. Participants paste links on the Amazing Race page.
      </p>
    );
  }

  const sorted = sortSubmissions(submissions, leaderboard);
  const groups = groupSubmissions(sorted);
  const pointsByGroup = new Map(leaderboard.map((row) => [row.groupLabel, row.points]));

  return (
    <div className="admin-submissions-by-team">
      {groups.map((group) => (
        <section key={group.label} className="admin-submissions-by-team__section">
          <header className="admin-submissions-by-team__head">
            <h3 className="admin-submissions-by-team__title">{group.label}</h3>
            {pointsByGroup.has(group.label) ? (
              <span className="admin-submissions-by-team__points">
                {pointsByGroup.get(group.label)} pts
              </span>
            ) : null}
          </header>
          <div className="admin-submissions-table-wrap">
            <table className="admin-submissions-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Hackathon team</th>
                  <th>Task</th>
                  <th>Pts</th>
                  <th>Thread</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.submitterName ?? "—"}
                      {row.submitterEmail ? (
                        <span className="admin-submissions-table__email">{row.submitterEmail}</span>
                      ) : null}
                    </td>
                    <td>
                      {row.teamSlug && row.teamName ? (
                        <Link
                          href={withBasePath(`/teams/${row.teamSlug}`)}
                          className="admin-submissions-table__team"
                        >
                          {row.teamName}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className="admin-submissions-table__task-num">#{row.taskNumber}</span>{" "}
                      {row.taskTitle}
                    </td>
                    <td className="font-[family-name:var(--font-mono)] text-[var(--color-wisp)]">
                      {row.taskPoints > 0 ? row.taskPoints : "—"}
                    </td>
                    <td>
                      <a
                        href={row.threadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-submissions-table__thread"
                      >
                        Open thread ↗
                      </a>
                    </td>
                    <td className="admin-submissions-table__when">{formatWhen(row.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
