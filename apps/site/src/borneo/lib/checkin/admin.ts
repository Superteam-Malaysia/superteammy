/**
 * Organizer check-in desk — displays guest checklist + read-only race group info.
 * Group assignment happens on the Amazing Race page (/amazing-race).
 */
import { eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, raceTeams } from "@borneo/lib/db/schema";
import { parseGroupNumber } from "@borneo/lib/checkin/group-number";
import {
  listParticipantsForCheckIn,
  updateParticipantRaceGroup,
} from "@borneo/lib/race/groups";

export type RaceTeamOption = {
  id: string;
  name: string;
};

export type CheckInGuest = {
  id: string;
  guestId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  passportFirstName: string | null;
  passportLastName: string | null;
  email: string;
  telegram: string | null;
  ticketName: string | null;
  approvalStatus: string | null;
  checkedInAt: string | null;
  merchReceivedAt: string | null;
  amazingRaceLeader: boolean;
  raceTeam: RaceTeamOption | null;
  groupNumber: number | null;
};

function displayName(row: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const fromParts = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.name?.trim() || fromParts || row.email;
}

function mapRow(row: {
  id: string;
  guestId: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  passportFirstName: string | null;
  passportLastName: string | null;
  email: string;
  telegram: string | null;
  ticketName: string | null;
  approvalStatus: string | null;
  checkedInAt: Date | null;
  merchReceivedAt: Date | null;
  amazingRaceLeader: boolean;
  raceTeamId: string | null;
  raceTeamName: string | null;
}): CheckInGuest {
  return {
    id: row.id,
    guestId: row.guestId,
    name: displayName(row),
    firstName: row.firstName?.trim() || null,
    lastName: row.lastName?.trim() || null,
    passportFirstName: row.passportFirstName?.trim() || null,
    passportLastName: row.passportLastName?.trim() || null,
    email: row.email,
    telegram: row.telegram,
    ticketName: row.ticketName,
    approvalStatus: row.approvalStatus,
    checkedInAt: row.checkedInAt?.toISOString() ?? null,
    merchReceivedAt: row.merchReceivedAt?.toISOString() ?? null,
    amazingRaceLeader: row.amazingRaceLeader,
    raceTeam:
      row.raceTeamId && row.raceTeamName
        ? { id: row.raceTeamId, name: row.raceTeamName }
        : null,
    groupNumber: parseGroupNumber(row.raceTeamName),
  };
}

export async function listRaceTeams(): Promise<RaceTeamOption[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select({ id: raceTeams.id, name: raceTeams.name })
    .from(raceTeams);

  return rows.sort(
    (a, b) =>
      (parseGroupNumber(a.name) ?? Number.MAX_SAFE_INTEGER) -
      (parseGroupNumber(b.name) ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function listGuestsForCheckIn(): Promise<CheckInGuest[]> {
  const rows = await listParticipantsForCheckIn();
  return rows.map(mapRow);
}

export async function getGuestForCheckIn(participantId: string): Promise<CheckInGuest | null> {
  const rows = await listParticipantsForCheckIn();
  const row = rows.find((guest) => guest.id === participantId);
  return row ? mapRow(row) : null;
}

export async function updateGuestChecklist(
  participantId: string,
  updates: {
    checkedIn?: boolean;
    merchReceived?: boolean;
    amazingRaceLeader?: boolean;
    raceTeamId?: string | null;
    groupNumber?: number | null;
  },
): Promise<CheckInGuest[]> {
  await updateParticipantRaceGroup(participantId, {
    ...(typeof updates.checkedIn === "boolean" ? { checkedIn: updates.checkedIn } : {}),
    ...(typeof updates.merchReceived === "boolean" ? { merchReceived: updates.merchReceived } : {}),
    ...(typeof updates.amazingRaceLeader === "boolean"
      ? { amazingRaceLeader: updates.amazingRaceLeader }
      : {}),
    ...(updates.groupNumber !== undefined ? { groupNumber: updates.groupNumber } : {}),
  });

  const guest = await getGuestForCheckIn(participantId);
  return guest ? [guest] : [];
}
