/** Public label for an Amazing Race group — keyed off the leader's name. */
export function raceTeamLabel(leaderName: string | null | undefined): string {
  const name = leaderName?.trim();
  if (name) return `Team ${name}`;
  return "Team (no leader)";
}
