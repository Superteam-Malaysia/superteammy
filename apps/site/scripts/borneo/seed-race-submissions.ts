#!/usr/bin/env tsx
/**
 * Seed Amazing Race thread submissions (demo + organizer posts).
 * Usage: DATABASE_URL=... npm run borneo:db:seed-race-submissions
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { raceSubmissions, teams } from "../../src/borneo/lib/db/schema";

const SEED_SUBMISSIONS = [
  {
    teamSlug: "nikki",
    taskId: "race-landed-in-kuching",
    threadUrl: "https://x.com/nikkideyy/status/2095386028551065890",
  },
] as const;

async function main() {
  const db = getDb();

  for (const seed of SEED_SUBMISSIONS) {
    const [team] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.slug, seed.teamSlug))
      .limit(1);

    if (!team) {
      console.warn(`  skip submission (team not found): ${seed.teamSlug}`);
      continue;
    }

    const now = new Date();

    await db
      .insert(raceSubmissions)
      .values({
        teamId: team.id,
        taskId: seed.taskId,
        threadUrl: seed.threadUrl,
        submittedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [raceSubmissions.teamId, raceSubmissions.taskId],
        set: {
          threadUrl: seed.threadUrl,
          updatedAt: now,
        },
      });

    console.log(`Seeded race submission: ${seed.teamSlug} · ${seed.taskId}`);
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
