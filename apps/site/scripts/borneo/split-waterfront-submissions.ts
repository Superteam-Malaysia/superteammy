#!/usr/bin/env tsx
/**
 * Split combined race-kuching-waterfront rows into per-activity task ids.
 * Reads tweet text (fxtwitter) to classify; manual overrides for media-only posts.
 *
 * Usage:
 *   DATABASE_URL=... npm run borneo:db:split-waterfront
 *   DATABASE_URL=... npm run borneo:db:split-waterfront -- --dry-run
 */
import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { raceSubmissions } from "../../src/borneo/lib/db/schema";
import {
  RETIRED_WATERFRONT_TASK_ID,
  resolveWaterfrontActivityTaskId,
} from "../../src/borneo/lib/race/waterfront-classify";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const db = getDb();

  const beforeCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(raceSubmissions)
    .where(eq(raceSubmissions.taskId, RETIRED_WATERFRONT_TASK_ID));

  const rows = await db
    .select()
    .from(raceSubmissions)
    .where(eq(raceSubmissions.taskId, RETIRED_WATERFRONT_TASK_ID));

  console.log(`Found ${rows.length} combined waterfront row(s) (db count ${beforeCount[0]?.n ?? 0}).`);

  if (rows.length === 0) {
    console.log("Nothing to split.");
    await closeDb();
    return;
  }

  const planned: { id: string; threadUrl: string; from: string; to: string }[] = [];

  for (const row of rows) {
    const target = await resolveWaterfrontActivityTaskId(row.threadUrl);
    planned.push({
      id: row.id,
      threadUrl: row.threadUrl,
      from: row.taskId,
      to: target,
    });
    console.log(`  ${row.id.slice(0, 8)}… → ${target}`);
    console.log(`    ${row.threadUrl}`);
  }

  if (dryRun) {
    console.log("Dry run — no rows updated.");
    await closeDb();
    return;
  }

  for (const item of planned) {
    await db
      .update(raceSubmissions)
      .set({ taskId: item.to, updatedAt: new Date() })
      .where(eq(raceSubmissions.id, item.id));
  }

  const afterCombined = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(raceSubmissions)
    .where(eq(raceSubmissions.taskId, RETIRED_WATERFRONT_TASK_ID));

  const totalAfter = await db.select({ n: sql<number>`count(*)::int` }).from(raceSubmissions);

  const remaining = afterCombined[0]?.n ?? 0;
  if (remaining > 0) {
    throw new Error(`${remaining} race-kuching-waterfront row(s) still remain after split.`);
  }

  console.log(`Split complete — ${planned.length} row(s) migrated, 0 post loss (${totalAfter[0]?.n} total submissions).`);
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb().catch(() => undefined);
  process.exit(1);
});
