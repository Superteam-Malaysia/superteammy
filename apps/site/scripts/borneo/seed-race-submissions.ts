#!/usr/bin/env tsx
/**
 * Seed Amazing Race thread submissions (demo + organizer posts).
 * Usage: DATABASE_URL=... npm run borneo:db:seed-race-submissions
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants, raceSubmissions, teams } from "../../src/borneo/lib/db/schema";

const SEED_SUBMISSIONS = [
  {
    participantGuestId: "staff-nikki",
    taskId: "race-landed-in-kuching",
    threadUrl: "https://x.com/nikkideyy/status/2095386028551065890",
    teamSlug: null as string | null,
  },
] as const;

async function main() {
  const db = getDb();

  for (const seed of SEED_SUBMISSIONS) {
    const [participant] = await db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.guestId, seed.participantGuestId))
      .limit(1);

    if (!participant) {
      console.warn(`  skip submission (participant not found): ${seed.participantGuestId}`);
      continue;
    }

    let teamId: string | null = null;
    if (seed.teamSlug) {
      const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.slug, seed.teamSlug))
        .limit(1);
      teamId = team?.id ?? null;
    }

    const now = new Date();

    await db
      .insert(raceSubmissions)
      .values({
        teamId,
        taskId: seed.taskId,
        threadUrl: seed.threadUrl,
        submittedBy: participant.id,
        submittedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [raceSubmissions.submittedBy, raceSubmissions.taskId],
        set: {
          threadUrl: seed.threadUrl,
          teamId,
          updatedAt: now,
        },
      });

    console.log(`Seeded race submission: ${seed.participantGuestId} · ${seed.taskId}`);
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
