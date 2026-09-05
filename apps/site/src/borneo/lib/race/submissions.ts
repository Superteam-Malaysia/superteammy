import { desc, eq } from "drizzle-orm";
import { parseGroupNumber } from "@borneo/lib/checkin/group-number";
import { getDb } from "@borneo/lib/db";
import { participants, raceSubmissions, raceTeams, teamMembers, teams } from "@borneo/lib/db/schema";
import { getRaceGroupLeaderNames } from "@borneo/lib/race/groups";
import { raceTeamLabel } from "@borneo/lib/race/group-label";
import { getRaceTask, raceThreadUrlsMatch, extractTweetIdFromUrl } from "@borneo/lib/race/validation";

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
  groupNumber: number | null;
  groupLabel: string | null;
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

/** Returns an error message when this X link is already used on another submission. */
export async function getRaceThreadUrlConflict(input: {
  participantId: string;
  taskId: string;
  threadUrl: string;
}): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({
      taskId: raceSubmissions.taskId,
      threadUrl: raceSubmissions.threadUrl,
      submitterId: raceSubmissions.submittedBy,
      submitterName: participants.name,
    })
    .from(raceSubmissions)
    .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id));

  for (const row of rows) {
    if (!raceThreadUrlsMatch(row.threadUrl, input.threadUrl)) continue;

    if (row.submitterId === input.participantId && row.taskId === input.taskId) {
      continue;
    }

    const who = row.submitterName?.trim() || "Someone else";
    return `This X link was already submitted${row.submitterId === input.participantId ? " for another milestone" : ` by ${who}`}.`;
  }

  return null;
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
    groupNumber: null,
    groupLabel: null,
  },
];

function dedupeRaceFeedByThread(items: RaceFeedItem[]): RaceFeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const tweetId = extractTweetIdFromUrl(item.threadUrl);
    const key = tweetId ?? `${item.submitterId}:${item.taskId}:${item.threadUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function listPublicRaceFeed(): Promise<RaceFeedItem[]> {
  const seedItems: RaceFeedItem[] = SEED_RACE_FEED.map((seed) => ({
    id: `seed-${seed.submitterId}-${seed.taskId}`,
    ...seed,
  }));

  try {
    const db = getDb();
    const leaderNames = await getRaceGroupLeaderNames();
    const rows = await db
      .select({
        id: raceSubmissions.id,
        taskId: raceSubmissions.taskId,
        threadUrl: raceSubmissions.threadUrl,
        submittedAt: raceSubmissions.submittedAt,
        submitterId: raceSubmissions.submittedBy,
        raceTeamName: raceTeams.name,
        submitterName: participants.name,
      })
      .from(raceSubmissions)
      .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
      .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
      .orderBy(desc(raceSubmissions.submittedAt));

    const dbItems: RaceFeedItem[] = rows.flatMap((row) => {
      const mapped = mapSubmissionRow(row);
      if (!mapped) return [];
      const groupNumber = parseGroupNumber(row.raceTeamName);
      const leaderName = groupNumber != null ? leaderNames.get(groupNumber) : undefined;
      return [
        {
          ...mapped,
          submitterId: row.submitterId,
          submitterName: row.submitterName ?? "Participant",
          groupNumber,
          groupLabel: groupNumber != null ? raceTeamLabel(leaderName) : null,
        },
      ];
    });

    const mergedSeeds = seedItems.filter(
      (seed) =>
        !dbItems.some(
          (row) =>
            row.taskId === seed.taskId &&
            (row.submitterId === seed.submitterId ||
              raceThreadUrlsMatch(row.threadUrl, seed.threadUrl)),
        ),
    );

    return dedupeRaceFeedByThread([...dbItems, ...mergedSeeds]).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  } catch {
    return dedupeRaceFeedByThread(seedItems).sort(
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
