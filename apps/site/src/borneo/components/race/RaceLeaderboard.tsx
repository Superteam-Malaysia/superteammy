"use client";

import { useCallback, useEffect, useState } from "react";
import type { RaceLeaderboardRow } from "@borneo/lib/race/leaderboard";
import { withBasePath } from "@borneo/lib/base-path";

const REFRESH_MS = 30_000;

type RaceLeaderboardProps = {
  initialRows?: RaceLeaderboardRow[];
};

export function RaceLeaderboard({ initialRows = [] }: RaceLeaderboardProps) {
  const [rows, setRows] = useState<RaceLeaderboardRow[]>(initialRows);
  const [loading, setLoading] = useState(initialRows.length === 0);

  const refresh = useCallback(async () => {
    const res = await fetch(withBasePath("/api/admin/race/leaderboard"), { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { leaderboard?: RaceLeaderboardRow[] };
    setRows(data.leaderboard ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <section className="race-leaderboard" aria-label="Amazing Race leaderboard">
      <p className="race-leaderboard__hint">
        Updates every 30s
      </p>

      {loading ? (
        <p className="race-leaderboard__empty">Loading standings…</p>
      ) : rows.length === 0 ? (
        <p className="race-leaderboard__empty">No race submissions yet — be the first on the board.</p>
      ) : (
        <div className="race-leaderboard__table-wrap">
          <table className="race-leaderboard__table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Team</th>
                <th scope="col">Pts</th>
                <th scope="col">Milestones</th>
                <th scope="col">Members</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.groupLabel}-${row.rank}`}>
                  <td className="race-leaderboard__rank">{row.rank}</td>
                  <td className="race-leaderboard__team">
                    {row.groupLabel}
                    {row.groupNumber != null ? (
                      <span className="race-leaderboard__group-num">Group {row.groupNumber}</span>
                    ) : null}
                  </td>
                  <td className="race-leaderboard__points">{row.points}</td>
                  <td className="race-leaderboard__milestones">{row.milestoneCount}</td>
                  <td className="race-leaderboard__members">{row.members.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
