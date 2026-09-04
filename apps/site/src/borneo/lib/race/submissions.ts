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
  teamSlug: string;
  teamName: string;
  submitterName: string | null;
};

export type AdminRaceSubmission = PublicRaceSubmission & {
  teamId: string;
  teamSlug: string;
  teamName: string;
  submitterName: string | null;
  submitterEmail: string | null;
};

export async function listTeamRaceSubmissions(teamId: string): Promise<PublicRaceSubmission[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(raceSubmissions)
    .where(eq(raceSubmissions.teamId, teamId))
    .orderBy(desc(raceSubmissions.submittedAt));

  return rows.flatMap((row) => {
    const task = getRaceTask(row.taskId);
    if (!task) return [];
    return [
      {
        id: row.id,
        taskId: row.taskId,
        threadUrl: row.threadUrl,
        submittedAt: row.submittedAt.toISOString(),
        taskTitle: task.title,
        taskNumber: task.number,
      },
    ];
  });
}

export async function upsertTeamRaceSubmission(input: {
  teamId: string;
  taskId: string;
  threadUrl: string;
  submittedBy: string;
}) {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(raceSubmissions)
    .values({
      teamId: input.teamId,
      taskId: input.taskId,
      threadUrl: input.threadUrl,
      submittedBy: input.submittedBy,
      submittedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [raceSubmissions.teamId, raceSubmissions.taskId],
      set: {
        threadUrl: input.threadUrl,
        submittedBy: input.submittedBy,
        updatedAt: now,
      },
    })
    .returning();

  return row;
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
      teamSlug: teams.slug,
      teamName: teams.name,
      submitterName: participants.name,
      submitterEmail: participants.email,
    })
    .from(raceSubmissions)
    .innerJoin(teams, eq(raceSubmissions.teamId, teams.id))
    .leftJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
    .orderBy(desc(raceSubmissions.submittedAt));

  return rows.flatMap((row) => {
    const task = getRaceTask(row.taskId);
    if (!task) return [];
    return [
      {
        id: row.id,
        teamId: row.teamId,
        teamSlug: row.teamSlug,
        teamName: row.teamName,
        taskId: row.taskId,
        threadUrl: row.threadUrl,
        submittedAt: row.submittedAt.toISOString(),
        taskTitle: task.title,
        taskNumber: task.number,
        submitterName: row.submitterName,
        submitterEmail: row.submitterEmail,
      },
    ];
  });
}

export const SEED_RACE_FEED: Omit<RaceFeedItem, "id">[] = [
  {
    taskId: "race-landed-in-kuching",
    threadUrl: "https://x.com/nikkideyy/status/2095386028551065890",
    submittedAt: "2026-09-04T06:00:00.000Z",
    taskTitle: "Landed in Kuching",
    taskNumber: 1,
    teamSlug: "nikki",
    teamName: "Nikki",
    submitterName: "Nikki",
  },
];

export async function listPublicRaceFeed(): Promise<RaceFeedItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: raceSubmissions.id,
      teamId: raceSubmissions.teamId,
      taskId: raceSubmissions.taskId,
      threadUrl: raceSubmissions.threadUrl,
      submittedAt: raceSubmissions.submittedAt,
      teamSlug: teams.slug,
      teamName: teams.name,
      submitterName: participants.name,
    })
    .from(raceSubmissions)
    .innerJoin(teams, eq(raceSubmissions.teamId, teams.id))
    .leftJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
    .orderBy(desc(raceSubmissions.submittedAt));

  const dbItems = rows.flatMap((row) => {
    const task = getRaceTask(row.taskId);
    if (!task) return [];
    return [
      {
        id: row.id,
        taskId: row.taskId,
        threadUrl: row.threadUrl,
        submittedAt: row.submittedAt.toISOString(),
        taskTitle: task.title,
        taskNumber: task.number,
        teamSlug: row.teamSlug,
        teamName: row.teamName,
        submitterName: row.submitterName,
      },
    ];
  });

  const seedItems: RaceFeedItem[] = SEED_RACE_FEED.filter(
    (seed) =>
      !rows.some((row) => row.teamSlug === seed.teamSlug && row.taskId === seed.taskId),
  ).map((seed) => ({
    id: `seed-${seed.teamSlug}-${seed.taskId}`,
    ...seed,
  }));

  return [...dbItems, ...seedItems].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export async function listParticipantTeams(participantId: string) {
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
