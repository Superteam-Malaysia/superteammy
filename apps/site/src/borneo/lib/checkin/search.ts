import { raceTeamLabel } from "@borneo/lib/race/group-label";
import type { CheckInGuest } from "@borneo/lib/checkin/admin";

export function normalizeCheckInSearch(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function telegramSearchValue(value: string | null): string | null {
  if (!value?.trim()) return null;
  const fromUrl = value.trim().match(/(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([^/?#]+)/i)?.[1];
  return normalizeCheckInSearch(fromUrl ?? value.trim().replace(/^@/, ""));
}

function guestTeamSearchLabel(
  guest: CheckInGuest,
  groupLeaderNames: Map<number, string>,
): string | null {
  if (guest.groupNumber == null) return null;
  const leaderName =
    guest.amazingRaceLeader && guest.name?.trim()
      ? guest.name.trim()
      : groupLeaderNames.get(guest.groupNumber);
  return raceTeamLabel(leaderName);
}

export function checkInGuestSearchFields(
  guest: CheckInGuest,
  groupLeaderNames: Map<number, string>,
): string[] {
  return [
    guest.name,
    guest.firstName,
    guest.lastName,
    guest.passportFirstName,
    guest.passportLastName,
    guest.email,
    guest.telegram,
    telegramSearchValue(guest.telegram),
    guest.ticketName,
    guest.guestId,
    guest.approvalStatus,
    guestTeamSearchLabel(guest, groupLeaderNames),
    guest.groupNumber != null ? String(guest.groupNumber) : null,
  ].filter((value): value is string => Boolean(value && String(value).trim()));
}

export function buildGroupLeaderNames(guests: CheckInGuest[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const guest of guests) {
    if (guest.amazingRaceLeader && guest.groupNumber != null && guest.name?.trim()) {
      map.set(guest.groupNumber, guest.name.trim());
    }
  }
  return map;
}

export function matchesCheckInSearch(
  guest: CheckInGuest,
  query: string,
  groupLeaderNames: Map<number, string>,
): boolean {
  const normalizedQuery = normalizeCheckInSearch(query);
  if (!normalizedQuery) return true;

  const fields = checkInGuestSearchFields(guest, groupLeaderNames).map(normalizeCheckInSearch);
  const haystack = fields.join(" ");

  if (haystack.includes(normalizedQuery)) return true;

  return normalizedQuery
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function filterCheckInGuestsBySearch(
  guests: CheckInGuest[],
  query: string,
): CheckInGuest[] {
  const normalizedQuery = normalizeCheckInSearch(query);
  if (!normalizedQuery) return guests;

  const groupLeaderNames = buildGroupLeaderNames(guests);
  return guests.filter((guest) => matchesCheckInSearch(guest, normalizedQuery, groupLeaderNames));
}
