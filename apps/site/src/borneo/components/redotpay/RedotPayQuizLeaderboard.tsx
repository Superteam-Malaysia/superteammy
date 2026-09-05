"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuizLeaderboardRow } from "@borneo/lib/redotpay-quiz/attempt";
import { withBasePath } from "@borneo/lib/base-path";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder}s`;
}

const REFRESH_MS = 30_000;

export function RedotPayQuizLeaderboard() {
  const [rows, setRows] = useState<QuizLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch(withBasePath("/api/redotpay/quiz/leaderboard"), { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { leaderboard?: QuizLeaderboardRow[] };
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
    <section className="redotpay-leaderboard" aria-label="RedotPay quiz leaderboard">
      <h2 className="redotpay-leaderboard__title">RedotPay quiz · internal leaderboard</h2>
      <p className="redotpay-leaderboard__hint">
        Staff only — ranked by score, then fastest finish. Updates every 30s. Timed-out attempts
        log as 0/10.
      </p>
      {loading ? (
        <p className="redotpay-leaderboard__empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="redotpay-leaderboard__empty">No completed attempts yet.</p>
      ) : (
        <div className="redotpay-leaderboard__table-wrap">
          <table className="redotpay-leaderboard__table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Score</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.participantId}>
                  <td>{row.rank}</td>
                  <td>{row.name}</td>
                  <td>
                    {row.score}/{row.totalQuestions}
                  </td>
                  <td>{formatDuration(row.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
