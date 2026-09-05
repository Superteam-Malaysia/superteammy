import { getRedotPayQuizLeaderboard } from "@borneo/lib/redotpay-quiz/attempt";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder}s`;
}

export async function RedotPayQuizLeaderboard() {
  const rows = await getRedotPayQuizLeaderboard();

  return (
    <section className="redotpay-leaderboard" aria-label="RedotPay quiz leaderboard">
      <h2 className="redotpay-leaderboard__title">RedotPay quiz · internal leaderboard</h2>
      <p className="redotpay-leaderboard__hint">
        Staff only — ranked by score, then fastest finish.
      </p>
      {rows.length === 0 ? (
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
