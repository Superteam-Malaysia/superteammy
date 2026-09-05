/**
 * Organizer check-in desk — internal ops data only.
 * Do not import into public pages, race feed, leaderboard, or participant APIs.
 */
import { and, asc, eq, ne } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, raceTeams } from "@borneo/lib/db/schema";
import { parseGroupNumber } from "@borneo/lib/checkin/group-number";

export type RaceTeamOption = {
  id: string;
  /** Numeric group label, e.g. "1", "2", "3". */
  name: string;
};

export type CheckInGuest = {
  id: string;
  guestId: string;
  name: string;
  email: string;
  telegram: string | null;
  ticketName: string | null;
  approvalStatus: string | null;
  checkedInAt: string | null;
  merchReceivedAt: string | null;
  amazingRaceLeader: boolean;
  raceTeam: RaceTeamOption | null;
  /** Parsed from race team name — null when unassigned. */
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

const checkInSelect = {
  id: participants.id,
  guestId: participants.guestId,
  name: participants.name,
  firstName: participants.firstName,
  lastName: participants.lastName,
  email: participants.email,
  telegram: participants.telegram,
  ticketName: participants.ticketName,
  approvalStatus: participants.approvalStatus,
  checkedInAt: participants.checkedInAt,
  merchReceivedAt: participants.merchReceivedAt,
  amazingRaceLeader: participants.amazingRaceLeader,
  raceTeamId: participants.raceTeamId,
  raceTeamName: raceTeams.name,
};

export async function listRaceTeams(): Promise<RaceTeamOption[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select({ id: raceTeams.id, name: raceTeams.name })
    .from(raceTeams);

  return rows.sort(
    (a, b) => (parseGroupNumber(a.name) ?? Number.MAX_SAFE_INTEGER) - (parseGroupNumber(b.name) ?? Number.MAX_SAFE_INTEGER),
  );
}

async function getOrCreateGroupByNumber(
  db: ReturnType<typeof getDb>,
  number: number,
): Promise<RaceTeamOption> {
  if (!Number.isFinite(number) || number < 1) {
    throw new Error("Group number must be a positive integer.");
  }

  const name = String(number);
  const [existing] = await db
    .select({ id: raceTeams.id, name: raceTeams.name })
    .from(raceTeams)
    .where(eq(raceTeams.name, name))
    .limit(1);
  if (existing) return existing;

  const slug = `group-${number}`;
  const [row] = await db
    .insert(raceTeams)
    .values({ name, slug })
    .returning({ id: raceTeams.id, name: raceTeams.name });

  return row;
}

async function getNextGroupNumber(db: ReturnType<typeof getDb>): Promise<number> {
  const teams = await listRaceTeams();
  const numbers = teams.map((team) => parseGroupNumber(team.name)).filter((n): n is number => n != null);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

async function resolveGroupNumberToTeamId(
  db: ReturnType<typeof getDb>,
  groupNumber: number | null,
): Promise<string | null> {
  if (groupNumber == null) return null;
  const team = await getOrCreateGroupByNumber(db, groupNumber);
  return team.id;
}

export async function listGuestsForCheckIn(): Promise<CheckInGuest[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select(checkInSelect)
    .from(participants)
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .orderBy(asc(participants.name), asc(participants.email));

  return rows.map(mapRow);
}

export async function getGuestForCheckIn(participantId: string): Promise<CheckInGuest | null> {
  if (!process.env.DATABASE_URL) return null;

  const db = getDb();
  const [row] = await db
    .select(checkInSelect)
    .from(participants)
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .where(eq(participants.id, participantId))
    .limit(1);

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
  const db = getDb();
  const affectedIds = new Set<string>([participantId]);

  const [current] = await db
    .select({
      raceTeamId: participants.raceTeamId,
      amazingRaceLeader: participants.amazingRaceLeader,
    })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!current) {
    return [];
  }

  const patch: {
    checkedInAt?: Date | null;
    merchReceivedAt?: Date | null;
    amazingRaceLeader?: boolean;
    raceTeamId?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  let resolvedRaceTeamId: string | null | undefined;

  if (updates.groupNumber !== undefined) {
    resolvedRaceTeamId = await resolveGroupNumberToTeamId(db, updates.groupNumber);
    patch.raceTeamId = resolvedRaceTeamId;
    if (resolvedRaceTeamId !== current.raceTeamId) {
      patch.amazingRaceLeader = false;
    }
  } else if (updates.raceTeamId !== undefined) {
    patch.raceTeamId = updates.raceTeamId;
    if (updates.raceTeamId !== current.raceTeamId) {
      patch.amazingRaceLeader = false;
    }
  }

  if (typeof updates.checkedIn === "boolean") {
    patch.checkedInAt = updates.checkedIn ? new Date() : null;
  }
  if (typeof updates.merchReceived === "boolean") {
    patch.merchReceivedAt = updates.merchReceived ? new Date() : null;
  }

  let nextRaceTeamId =
    resolvedRaceTeamId !== undefined
      ? resolvedRaceTeamId
      : updates.raceTeamId !== undefined
        ? updates.raceTeamId
        : current.raceTeamId;

  if (updates.amazingRaceLeader === true) {
    if (!nextRaceTeamId) {
      const nextNumber = await getNextGroupNumber(db);
      const team = await getOrCreateGroupByNumber(db, nextNumber);
      patch.raceTeamId = team.id;
      nextRaceTeamId = team.id;
    }

    const previousLeaders = await db
      .select({ id: participants.id })
      .from(participants)
      .where(
        and(
          eq(participants.raceTeamId, nextRaceTeamId),
          ne(participants.id, participantId),
          eq(participants.amazingRaceLeader, true),
        ),
      );

    for (const row of previousLeaders) {
      affectedIds.add(row.id);
      await db
        .update(participants)
        .set({ amazingRaceLeader: false, updatedAt: new Date() })
        .where(eq(participants.id, row.id));
    }

    patch.amazingRaceLeader = true;
  } else if (typeof updates.amazingRaceLeader === "boolean") {
    patch.amazingRaceLeader = updates.amazingRaceLeader;
  }

  await db.update(participants).set(patch).where(eq(participants.id, participantId));

  const guests = await Promise.all([...affectedIds].map((id) => getGuestForCheckIn(id)));
  return guests.filter((guest): guest is CheckInGuest => guest != null);
}
