import { deckMappingForSlug } from "@borneo/data/demo-day-decks";
import type { PublicTeam } from "./types";

export function teamHasDemoDayDeck(team: { slug: string; deckUrl?: string | null }): boolean {
  if (deckMappingForSlug(team.slug)) return true;
  return Boolean(team.deckUrl?.includes("/demo-day/decks/"));
}

/**
 * Directory listing: Demo Day decks first.
 * Hide a no-deck team when every member already sits on a deck team
 * (they moved). Keep it if anyone on it is not on a deck team, so they
 * still appear in the directory.
 */
export function directoryTeams(teams: PublicTeam[]): PublicTeam[] {
  const onADeckTeam = new Set<string>();
  for (const team of teams) {
    if (!teamHasDemoDayDeck(team)) continue;
    for (const member of team.members) onADeckTeam.add(member.id);
  }

  const visible = teams.filter((team) => {
    if (teamHasDemoDayDeck(team)) return true;
    return team.members.some((member) => !onADeckTeam.has(member.id));
  });

  return visible.sort((a, b) => {
    const aDeck = teamHasDemoDayDeck(a);
    const bDeck = teamHasDemoDayDeck(b);
    if (aDeck && bDeck) {
      const aPage = deckMappingForSlug(a.slug)?.pageStart ?? 9999;
      const bPage = deckMappingForSlug(b.slug)?.pageStart ?? 9999;
      if (aPage !== bPage) return aPage - bPage;
    } else if (aDeck !== bDeck) {
      return aDeck ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
