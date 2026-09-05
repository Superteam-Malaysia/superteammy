#!/usr/bin/env tsx
/**
 * Remap legacy race_submissions.task_id values to the canonical 16-milestone ids.
 *
 * Usage:
 *   DATABASE_URL=... npm run borneo:db:migrate-race-task-ids
 *   DATABASE_URL=... npm run borneo:db:migrate-race-task-ids -- --dry-run
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inArray, sql } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { raceSubmissions } from "../../src/borneo/lib/db/schema";
import {
  CANONICAL_MILESTONE_TASK_IDS,
  LEGACY_RACE_TASK_ID_MAP,
} from "../../src/borneo/lib/race/task-id-migration";

const dryRun = process.argv.includes("--dry-run");
const legacyIds = Object.keys(LEGACY_RACE_TASK_ID_MAP);
const migrationSql = readFileSync(
  resolve(__dirname, "../../drizzle/0014_migrate_race_task_ids.sql"),
  "utf8",
);

async function countByTaskId() {
  const db = getDb();
  const rows = await db.execute(sql`
    SELECT task_id, count(*)::int AS n
    FROM race_submissions
    GROUP BY task_id
    ORDER BY task_id
  `);
  return rows as unknown as { task_id: string; n: number }[];
}

function printCounts(label: string, rows: { task_id: string; n: number }[]) {
  console.log(label);
  for (const row of rows) {
    const tag = CANONICAL_MILESTONE_TASK_IDS.has(row.task_id)
      ? ""
      : legacyIds.includes(row.task_id)
        ? "  legacy"
        : "  unknown";
    console.log(`  ${row.task_id}: ${row.n}${tag}`);
  }
}

async function migrate() {
  const db = getDb();
  const before = await countByTaskId();
  printCounts("Before:", before);

  const legacyRows = await db
    .select()
    .from(raceSubmissions)
    .where(inArray(raceSubmissions.taskId, legacyIds));

  if (legacyRows.length === 0) {
    console.log("No legacy task ids to migrate.");
    await closeDb();
    return;
  }

  console.log(`Found ${legacyRows.length} legacy row(s) to process.`);

  if (dryRun) {
    for (const row of legacyRows) {
      const target = LEGACY_RACE_TASK_ID_MAP[row.taskId];
      console.log(`  would migrate ${row.taskId} → ${target} (${row.id})`);
    }
    await closeDb();
    return;
  }

  await db.execute(sql.raw(migrationSql));

  const after = await countByTaskId();
  printCounts("After:", after);

  const remainingLegacy = await db
    .select({ id: raceSubmissions.id, taskId: raceSubmissions.taskId })
    .from(raceSubmissions)
    .where(inArray(raceSubmissions.taskId, legacyIds));

  if (remainingLegacy.length > 0) {
    console.warn("Legacy rows still present:", remainingLegacy);
  } else {
    console.log("Migration complete — no legacy task ids remain.");
  }

  await closeDb();
}

migrate().catch(async (err) => {
  console.error(err);
  await closeDb().catch(() => undefined);
  process.exit(1);
});
