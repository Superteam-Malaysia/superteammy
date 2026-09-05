/** Public label for an Amazing Race group — always named after the leader who formed it. */
export function raceTeamLabel(leaderName: string | null | undefined): string | null {
  const name = leaderName?.trim();
  if (!name) return null;
  return `Team ${name}`;
}
