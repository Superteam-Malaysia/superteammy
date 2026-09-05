import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, teamMembers, teams } from "@borneo/lib/db/schema";

export type CheckInGuestTeam = {
  slug: string;
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
  hackathonTeams: CheckInGuestTeam[];
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

function mapRow(
  row: {
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
  },
  hackathonTeams: CheckInGuestTeam[],
): CheckInGuest {
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
    hackathonTeams,
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
};

async function hackathonTeamsByParticipantId(
  participantIds: string[],
): Promise<Map<string, CheckInGuestTeam[]>> {
  const map = new Map<string, CheckInGuestTeam[]>();
  if (!process.env.DATABASE_URL || participantIds.length === 0) return map;

  const db = getDb();
  const rows = await db
    .select({
      participantId: teamMembers.participantId,
      name: teams.name,
      slug: teams.slug,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(inArray(teamMembers.participantId, participantIds))
    .orderBy(asc(teams.name));

  for (const row of rows) {
    const existing = map.get(row.participantId) ?? [];
    existing.push({ name: row.name, slug: row.slug });
    map.set(row.participantId, existing);
  }

  return map;
}

export async function listGuestsForCheckIn(): Promise<CheckInGuest[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select(checkInSelect)
    .from(participants)
    .orderBy(asc(participants.name), asc(participants.email));

  const teamMap = await hackathonTeamsByParticipantId(rows.map((row) => row.id));
  return rows.map((row) => mapRow(row, teamMap.get(row.id) ?? []));
}

export async function getGuestForCheckIn(participantId: string): Promise<CheckInGuest | null> {
  if (!process.env.DATABASE_URL) return null;

  const db = getDb();
  const [row] = await db
    .select(checkInSelect)
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!row) return null;
  const teamMap = await hackathonTeamsByParticipantId([participantId]);
  return mapRow(row, teamMap.get(participantId) ?? []);
}

export async function updateGuestChecklist(
  participantId: string,
  updates: {
    checkedIn?: boolean;
    merchReceived?: boolean;
    amazingRaceLeader?: boolean;
  },
): Promise<CheckInGuest[]> {
  const db = getDb();
  const affectedIds = new Set<string>([participantId]);

  if (updates.amazingRaceLeader === true) {
    const teamRows = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.participantId, participantId));

    const teamIds = teamRows.map((row) => row.teamId);
    if (teamIds.length > 0) {
      const previousLeaders = await db
        .select({ participantId: teamMembers.participantId })
        .from(teamMembers)
        .innerJoin(participants, eq(teamMembers.participantId, participants.id))
        .where(
          and(
            inArray(teamMembers.teamId, teamIds),
            ne(teamMembers.participantId, participantId),
            eq(participants.amazingRaceLeader, true),
          ),
        );

      for (const row of previousLeaders) {
        affectedIds.add(row.participantId);
        await db
          .update(participants)
          .set({ amazingRaceLeader: false, updatedAt: new Date() })
          .where(eq(participants.id, row.participantId));
      }
    }
  }

  const patch: {
    checkedInAt?: Date | null;
    merchReceivedAt?: Date | null;
    amazingRaceLeader?: boolean;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (typeof updates.checkedIn === "boolean") {
    patch.checkedInAt = updates.checkedIn ? new Date() : null;
  }
  if (typeof updates.merchReceived === "boolean") {
    patch.merchReceivedAt = updates.merchReceived ? new Date() : null;
  }
  if (typeof updates.amazingRaceLeader === "boolean") {
    patch.amazingRaceLeader = updates.amazingRaceLeader;
  }

  await db.update(participants).set(patch).where(eq(participants.id, participantId));

  const guests = await Promise.all([...affectedIds].map((id) => getGuestForCheckIn(id)));
  return guests.filter((guest): guest is CheckInGuest => guest != null);
}
