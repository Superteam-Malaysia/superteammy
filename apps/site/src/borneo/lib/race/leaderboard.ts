import { asc, eq, isNotNull } from "drizzle-orm";
import { parseGroupNumber } from "@borneo/lib/checkin/group-number";
import { getDb } from "@borneo/lib/db";
import { participants, raceSubmissions, raceTeams } from "@borneo/lib/db/schema";
import { getRaceGroupLeaderNames } from "@borneo/lib/race/groups";
import { raceTeamLabel } from "@borneo/lib/race/group-label";
import { getRaceTask } from "@borneo/lib/race/validation";

export type RaceLeaderboardRow = {
  rank: number;
  groupNumber: number | null;
  groupLabel: string;
  points: number;
  milestoneCount: number;
  submissionCount: number;
  members: string[];
};

function displayName(row: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  const fromParts = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.name?.trim() || fromParts || "Participant";
}

function pointsForTask(taskId: string): number {
  const task = getRaceTask(taskId);
  if (!task || task.pointsBase <= 0) return 0;
  return task.pointsBase;
}

type GroupBucket = {
  groupNumber: number | null;
  groupLabel: string;
  points: number;
  tasks: Set<string>;
  submissionCount: number;
  members: Set<string>;
};

/** Team-wise Amazing Race standings from logged submissions (base points per task). */
export async function getRaceLeaderboard(): Promise<RaceLeaderboardRow[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const leaderNames = await getRaceGroupLeaderNames();

  const memberRows = await db
    .select({
      id: participants.id,
      name: participants.name,
      firstName: participants.firstName,
      lastName: participants.lastName,
      raceTeamId: participants.raceTeamId,
      raceTeamName: raceTeams.name,
    })
    .from(participants)
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id))
    .where(isNotNull(participants.raceTeamId))
    .orderBy(asc(participants.name));

  const buckets = new Map<string, GroupBucket>();

  function bucketForParticipant(row: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    raceTeamId: string | null;
    raceTeamName: string | null;
  }): GroupBucket {
    const name = displayName(row);
    if (row.raceTeamId) {
      const groupNumber = parseGroupNumber(row.raceTeamName);
      const leaderName =
        groupNumber != null ? leaderNames.get(groupNumber) ?? null : null;
      const groupLabel =
        raceTeamLabel(leaderName) ??
        (groupNumber != null ? `Group ${groupNumber}` : "Race group");
      const key = `team:${row.raceTeamId}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          groupNumber,
          groupLabel,
          points: 0,
          tasks: new Set(),
          submissionCount: 0,
          members: new Set(),
        };
        buckets.set(key, bucket);
      }
      bucket.members.add(name);
      return bucket;
    }

    const key = `solo:${row.id}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        groupNumber: null,
        groupLabel: `Solo · ${name}`,
        points: 0,
        tasks: new Set(),
        submissionCount: 0,
        members: new Set([name]),
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  for (const row of memberRows) {
    bucketForParticipant(row);
  }

  const submissionRows = await db
    .select({
      taskId: raceSubmissions.taskId,
      submitterId: raceSubmissions.submittedBy,
      name: participants.name,
      firstName: participants.firstName,
      lastName: participants.lastName,
      raceTeamId: participants.raceTeamId,
      raceTeamName: raceTeams.name,
    })
    .from(raceSubmissions)
    .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id));

  for (const row of submissionRows) {
    const pts = pointsForTask(row.taskId);
    if (pts <= 0) continue;

    const bucket = bucketForParticipant({
      id: row.submitterId,
      name: row.name,
      firstName: row.firstName,
      lastName: row.lastName,
      raceTeamId: row.raceTeamId,
      raceTeamName: row.raceTeamName,
    });

    bucket.points += pts;
    bucket.tasks.add(row.taskId);
    bucket.submissionCount += 1;
    bucket.members.add(displayName(row));
  }

  const sorted = [...buckets.values()]
    .filter((bucket) => bucket.points > 0)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.tasks.size !== a.tasks.size) return b.tasks.size - a.tasks.size;
      const aNum = a.groupNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.groupNumber ?? Number.MAX_SAFE_INTEGER;
      return aNum - bNum;
    });

  return sorted.map((bucket, index) => ({
    rank: index + 1,
    groupNumber: bucket.groupNumber,
    groupLabel: bucket.groupLabel,
    points: bucket.points,
    milestoneCount: bucket.tasks.size,
    submissionCount: bucket.submissionCount,
    members: [...bucket.members].sort((x, y) => x.localeCompare(y)),
  }));
}
