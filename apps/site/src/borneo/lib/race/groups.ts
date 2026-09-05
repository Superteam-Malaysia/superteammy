import { and, asc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, raceTeams } from "@borneo/lib/db/schema";
import { parseGroupNumber } from "@borneo/lib/checkin/group-number";
import {
  MAX_RACE_GROUP_SIZE,
  type ParticipantRaceGroup,
  type RaceGroupSummary,
} from "@borneo/lib/race/group-types";

export { MAX_RACE_GROUP_SIZE } from "@borneo/lib/race/group-types";
export type { ParticipantRaceGroup, RaceGroupSummary } from "@borneo/lib/race/group-types";

type RaceTeamRow = { id: string; name: string };

export async function listRaceTeamRows(): Promise<RaceTeamRow[]> {
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

async function getOrCreateGroupByNumber(
  db: ReturnType<typeof getDb>,
  number: number,
): Promise<RaceTeamRow> {
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

export async function getNextGroupNumber(db: ReturnType<typeof getDb>): Promise<number> {
  const teams = await listRaceTeamRows();
  const numbers = teams
    .map((team) => parseGroupNumber(team.name))
    .filter((n): n is number => n != null);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

async function countGroupMembers(db: ReturnType<typeof getDb>, raceTeamId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participants)
    .where(eq(participants.raceTeamId, raceTeamId));

  return row?.count ?? 0;
}

async function deleteRaceGroupIfEmpty(
  db: ReturnType<typeof getDb>,
  raceTeamId: string | null | undefined,
): Promise<void> {
  if (!raceTeamId) return;

  const memberCount = await countGroupMembers(db, raceTeamId);
  if (memberCount > 0) return;

  await db.delete(raceTeams).where(eq(raceTeams.id, raceTeamId));
}

async function groupLeaderName(
  db: ReturnType<typeof getDb>,
  raceTeamId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ name: participants.name })
    .from(participants)
    .where(and(eq(participants.raceTeamId, raceTeamId), eq(participants.amazingRaceLeader, true)))
    .limit(1);

  return row?.name?.trim() || null;
}

/** group number → leader display name */
export async function getRaceGroupLeaderNames(): Promise<Map<number, string>> {
  if (!process.env.DATABASE_URL) return new Map();

  const db = getDb();
  const rows = await db
    .select({
      raceTeamName: raceTeams.name,
      leaderName: participants.name,
    })
    .from(participants)
    .innerJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .where(eq(participants.amazingRaceLeader, true));

  const map = new Map<number, string>();
  for (const row of rows) {
    const number = parseGroupNumber(row.raceTeamName);
    const name = row.leaderName?.trim();
    if (number != null && name) map.set(number, name);
  }
  return map;
}

export async function listRaceGroupSummaries(): Promise<RaceGroupSummary[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const teams = await listRaceTeamRows();
  const summaries: RaceGroupSummary[] = [];

  for (const team of teams) {
    const number = parseGroupNumber(team.name);
    if (number == null) continue;

    const memberCount = await countGroupMembers(db, team.id);
    if (memberCount === 0) continue;

    const leaderName = await groupLeaderName(db, team.id);
    if (!leaderName) continue;

    summaries.push({
      number,
      memberCount,
      isFull: memberCount >= MAX_RACE_GROUP_SIZE,
      hasLeader: true,
      leaderName,
    });
  }

  return summaries;
}

async function participantGroupSnapshot(
  db: ReturnType<typeof getDb>,
  participantId: string,
): Promise<{
  raceTeamId: string | null;
  amazingRaceLeader: boolean;
  groupNumber: number | null;
  memberCount: number;
}> {
  const [row] = await db
    .select({
      raceTeamId: participants.raceTeamId,
      amazingRaceLeader: participants.amazingRaceLeader,
      raceTeamName: raceTeams.name,
    })
    .from(participants)
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!row) {
    throw new Error("Participant not found.");
  }

  const groupNumber = parseGroupNumber(row.raceTeamName);
  const memberCount = row.raceTeamId ? await countGroupMembers(db, row.raceTeamId) : 0;

  return {
    raceTeamId: row.raceTeamId,
    amazingRaceLeader: row.amazingRaceLeader,
    groupNumber,
    memberCount,
  };
}

export async function getParticipantRaceGroup(participantId: string): Promise<ParticipantRaceGroup> {
  if (!process.env.DATABASE_URL) {
    return {
      groupNumber: null,
      isLeader: false,
      memberCount: 0,
      leaderName: null,
      nextGroupNumber: 1,
      groups: [],
    };
  }

  const db = getDb();
  const [current, groups, nextGroupNumber] = await Promise.all([
    participantGroupSnapshot(db, participantId),
    listRaceGroupSummaries(),
    getNextGroupNumber(db),
  ]);

  return {
    groupNumber: current.groupNumber,
    isLeader: current.amazingRaceLeader,
    memberCount: current.memberCount,
    leaderName: current.raceTeamId ? await groupLeaderName(db, current.raceTeamId) : null,
    nextGroupNumber,
    groups,
  };
}

export async function becomeRaceGroupLeader(participantId: string): Promise<ParticipantRaceGroup> {
  const db = getDb();
  const current = await participantGroupSnapshot(db, participantId);

  if (current.raceTeamId) {
    throw new Error("Leave your current group before starting a new one.");
  }

  const nextNumber = await getNextGroupNumber(db);
  const team = await getOrCreateGroupByNumber(db, nextNumber);

  await db
    .update(participants)
    .set({
      raceTeamId: team.id,
      amazingRaceLeader: true,
      updatedAt: new Date(),
    })
    .where(eq(participants.id, participantId));

  return getParticipantRaceGroup(participantId);
}

export async function joinRaceGroup(
  participantId: string,
  groupNumber: number,
): Promise<ParticipantRaceGroup> {
  if (!Number.isFinite(groupNumber) || groupNumber < 1) {
    throw new Error("Pick a valid group number.");
  }

  const db = getDb();
  const current = await participantGroupSnapshot(db, participantId);

  if (current.groupNumber === groupNumber) {
    return getParticipantRaceGroup(participantId);
  }

  const team = await getOrCreateGroupByNumber(db, groupNumber);
  const memberCount = await countGroupMembers(db, team.id);

  if (current.raceTeamId !== team.id && memberCount >= MAX_RACE_GROUP_SIZE) {
    throw new Error(`Group ${groupNumber} is full (${MAX_RACE_GROUP_SIZE} people max).`);
  }

  const previousTeamId =
    current.raceTeamId && current.raceTeamId !== team.id ? current.raceTeamId : null;

  await db
    .update(participants)
    .set({
      raceTeamId: team.id,
      amazingRaceLeader: false,
      updatedAt: new Date(),
    })
    .where(eq(participants.id, participantId));

  if (previousTeamId) {
    await deleteRaceGroupIfEmpty(db, previousTeamId);
  }

  return getParticipantRaceGroup(participantId);
}

export async function leaveRaceGroup(participantId: string): Promise<ParticipantRaceGroup> {
  const db = getDb();
  const current = await participantGroupSnapshot(db, participantId);

  if (!current.raceTeamId) {
    return getParticipantRaceGroup(participantId);
  }

  const previousTeamId = current.raceTeamId;

  await db
    .update(participants)
    .set({
      raceTeamId: null,
      amazingRaceLeader: false,
      updatedAt: new Date(),
    })
    .where(eq(participants.id, participantId));

  await deleteRaceGroupIfEmpty(db, previousTeamId);

  return getParticipantRaceGroup(participantId);
}

/** Organizer check-in — same group assignment rules with optional leader flag. */
export async function updateParticipantRaceGroup(
  participantId: string,
  updates: {
    checkedIn?: boolean;
    merchReceived?: boolean;
    amazingRaceLeader?: boolean;
    groupNumber?: number | null;
  },
): Promise<void> {
  const db = getDb();

  if (typeof updates.checkedIn === "boolean") {
    await db
      .update(participants)
      .set({
        checkedInAt: updates.checkedIn ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));
  }

  if (typeof updates.merchReceived === "boolean") {
    await db
      .update(participants)
      .set({
        merchReceivedAt: updates.merchReceived ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participantId));
  }

  if (updates.groupNumber === null) {
    await leaveRaceGroup(participantId);
    return;
  }

  if (typeof updates.groupNumber === "number") {
    await joinRaceGroup(participantId, updates.groupNumber);
  }

  if (updates.amazingRaceLeader === true) {
    const current = await participantGroupSnapshot(db, participantId);
    if (!current.raceTeamId) {
      await becomeRaceGroupLeader(participantId);
      return;
    }

    const previousLeaders = await db
      .select({ id: participants.id })
      .from(participants)
      .where(
        and(
          eq(participants.raceTeamId, current.raceTeamId),
          ne(participants.id, participantId),
          eq(participants.amazingRaceLeader, true),
        ),
      );

    for (const row of previousLeaders) {
      await db
        .update(participants)
        .set({ amazingRaceLeader: false, updatedAt: new Date() })
        .where(eq(participants.id, row.id));
    }

    await db
      .update(participants)
      .set({ amazingRaceLeader: true, updatedAt: new Date() })
      .where(eq(participants.id, participantId));
  } else if (updates.amazingRaceLeader === false) {
    await db
      .update(participants)
      .set({ amazingRaceLeader: false, updatedAt: new Date() })
      .where(eq(participants.id, participantId));
  }
}

export async function listParticipantsForCheckIn() {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select({
      id: participants.id,
      guestId: participants.guestId,
      name: participants.name,
      firstName: participants.firstName,
      lastName: participants.lastName,
      passportFirstName: participants.passportFirstName,
      passportLastName: participants.passportLastName,
      email: participants.email,
      telegram: participants.telegram,
      ticketName: participants.ticketName,
      approvalStatus: participants.approvalStatus,
      checkedInAt: participants.checkedInAt,
      merchReceivedAt: participants.merchReceivedAt,
      amazingRaceLeader: participants.amazingRaceLeader,
      raceTeamId: participants.raceTeamId,
      raceTeamName: raceTeams.name,
    })
    .from(participants)
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .orderBy(asc(participants.name), asc(participants.email));

  return rows;
}
