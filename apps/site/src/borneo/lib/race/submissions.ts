import { desc, eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, raceSubmissions, teamMembers, teams } from "@borneo/lib/db/schema";
import { getRaceTask } from "@borneo/lib/race/validation";

export type PublicRaceSubmission = {
  id: string;
  taskId: string;
  threadUrl: string;
  submittedAt: string;
  taskTitle: string;
  taskNumber: number;
};

export type RaceFeedItem = PublicRaceSubmission & {
  submitterId: string;
  submitterName: string;
  teamSlug: string | null;
  teamName: string | null;
};

export type AdminRaceSubmission = PublicRaceSubmission & {
  submitterId: string;
  teamId: string | null;
  teamSlug: string | null;
  teamName: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
};

export type ParticipantTeamOption = {
  teamId: string;
  slug: string;
  name: string;
  role: string;
};

function mapSubmissionRow(row: {
  id: string;
  taskId: string;
  threadUrl: string;
  submittedAt: Date;
}) {
  const task = getRaceTask(row.taskId);
  if (!task) return null;
  return {
    id: row.id,
    taskId: row.taskId,
    threadUrl: row.threadUrl,
    submittedAt: row.submittedAt.toISOString(),
    taskTitle: task.title,
    taskNumber: task.number,
  };
}

export async function listParticipantRaceSubmissions(
  participantId: string,
): Promise<PublicRaceSubmission[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(raceSubmissions)
    .where(eq(raceSubmissions.submittedBy, participantId))
    .orderBy(desc(raceSubmissions.submittedAt));

  return rows.flatMap((row) => {
    const mapped = mapSubmissionRow(row);
    return mapped ? [mapped] : [];
  });
}

export async function upsertParticipantRaceSubmission(input: {
  participantId: string;
  taskId: string;
  threadUrl: string;
  teamId?: string | null;
}) {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(raceSubmissions)
    .values({
      teamId: input.teamId ?? null,
      taskId: input.taskId,
      threadUrl: input.threadUrl,
      submittedBy: input.participantId,
      submittedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [raceSubmissions.submittedBy, raceSubmissions.taskId],
      set: {
        threadUrl: input.threadUrl,
        teamId: input.teamId ?? null,
        updatedAt: now,
      },
    })
    .returning();

  return row;
}

/** @deprecated Team-scoped listing — use listParticipantRaceSubmissions. */
export async function listTeamRaceSubmissions(teamId: string): Promise<PublicRaceSubmission[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(raceSubmissions)
    .where(eq(raceSubmissions.teamId, teamId))
    .orderBy(desc(raceSubmissions.submittedAt));

  return rows.flatMap((row) => {
    const mapped = mapSubmissionRow(row);
    return mapped ? [mapped] : [];
  });
}

export async function listAllRaceSubmissionsForAdmin(): Promise<AdminRaceSubmission[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: raceSubmissions.id,
      teamId: raceSubmissions.teamId,
      taskId: raceSubmissions.taskId,
      threadUrl: raceSubmissions.threadUrl,
      submittedAt: raceSubmissions.submittedAt,
      submitterId: raceSubmissions.submittedBy,
      teamSlug: teams.slug,
      teamName: teams.name,
      submitterName: participants.name,
      submitterEmail: participants.email,
    })
    .from(raceSubmissions)
    .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
    .leftJoin(teams, eq(raceSubmissions.teamId, teams.id))
    .orderBy(desc(raceSubmissions.submittedAt));

  return rows.flatMap((row) => {
    const mapped = mapSubmissionRow(row);
    if (!mapped) return [];
    return [
      {
        ...mapped,
        submitterId: row.submitterId,
        teamId: row.teamId,
        teamSlug: row.teamSlug,
        teamName: row.teamName,
        submitterName: row.submitterName,
        submitterEmail: row.submitterEmail,
      },
    ];
  });
}

export const SEED_RACE_FEED: Omit<RaceFeedItem, "id">[] = [
  {
    taskId: "race-landed-in-kuching",
    threadUrl: "https://x.com/hanstmy/status/2095499835495600142",
    submittedAt: "2026-09-04T07:15:00.000Z",
    taskTitle: "Landed in Kuching",
    taskNumber: 1,
    submitterId: "seed-han",
    submitterName: "Han",
    teamSlug: null,
    teamName: null,
  },
  {
    taskId: "race-landed-in-kuching",
    threadUrl: "https://x.com/nikkideyy/status/2095386028551065890",
    submittedAt: "2026-09-04T06:00:00.000Z",
    taskTitle: "Landed in Kuching",
    taskNumber: 1,
    submitterId: "seed-nikki",
    submitterName: "Nikki",
    teamSlug: null,
    teamName: null,
  },
];

export async function listPublicRaceFeed(): Promise<RaceFeedItem[]> {
  const seedItems: RaceFeedItem[] = SEED_RACE_FEED.map((seed) => ({
    id: `seed-${seed.submitterId}-${seed.taskId}`,
    ...seed,
  }));

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: raceSubmissions.id,
        taskId: raceSubmissions.taskId,
        threadUrl: raceSubmissions.threadUrl,
        submittedAt: raceSubmissions.submittedAt,
        submitterId: raceSubmissions.submittedBy,
        teamSlug: teams.slug,
        teamName: teams.name,
        submitterName: participants.name,
      })
      .from(raceSubmissions)
      .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
      .leftJoin(teams, eq(raceSubmissions.teamId, teams.id))
      .orderBy(desc(raceSubmissions.submittedAt));

    const dbItems: RaceFeedItem[] = rows.flatMap((row) => {
      const mapped = mapSubmissionRow(row);
      if (!mapped) return [];
      return [
        {
          ...mapped,
          submitterId: row.submitterId,
          submitterName: row.submitterName ?? "Participant",
          teamSlug: row.teamSlug,
          teamName: row.teamName,
        },
      ];
    });

    const mergedSeeds = seedItems.filter(
      (seed) =>
        !dbItems.some(
          (row) => row.submitterId === seed.submitterId && row.taskId === seed.taskId,
        ),
    );

    return [...dbItems, ...mergedSeeds].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  } catch {
    return seedItems.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }
}

export async function listParticipantTeams(participantId: string): Promise<ParticipantTeamOption[]> {
  const db = getDb();
  return db
    .select({
      teamId: teams.id,
      slug: teams.slug,
      name: teams.name,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.participantId, participantId))
    .orderBy(teams.name);
}
