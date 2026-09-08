import { getRaceRulebookRows } from "@borneo/data/race-rulebook";
import { RACE_SUBMISSION_RULES } from "@borneo/data/race-tasks";
import { SUBMISSION_CUTOFF } from "@borneo/data/submission-cutoff";

export function RaceRulebookTable() {
  const rows = getRaceRulebookRows();

  return (
    <section className="race-rulebook" aria-labelledby="race-rulebook-title">
      <h2 id="race-rulebook-title" className="race-rulebook__title">
        Rulebook
      </h2>
      <p className="race-rulebook__cutoff">
        {SUBMISSION_CUTOFF.banner}. Nothing accepted after.
      </p>

      <ul className="race-rulebook__rules list-none">
        {RACE_SUBMISSION_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <div className="race-rulebook__table-wrap">
        <table className="race-rulebook__table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Milestone</th>
              <th scope="col">Points</th>
              <th scope="col">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="race-rulebook__num">{row.label}</td>
                <td className="race-rulebook__title-cell">{row.title}</td>
                <td className="race-rulebook__pts">{row.points}</td>
                <td className="race-rulebook__due">{row.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
