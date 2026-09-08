#!/usr/bin/env tsx
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

/** First ledger migration — older files assumed applied on existing production DBs. */
const LEDGER_START_FILE = "0024_race_multi_submit.sql";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const dir = resolve(__dirname, "../../drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const db = postgres(url, { max: 1 });

  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const appliedRows = await db<{ filename: string }[]>`
    SELECT filename FROM _schema_migrations ORDER BY filename
  `;
  const applied = new Set(appliedRows.map((row) => row.filename));

  if (applied.size === 0) {
    const [{ exists }] = await db<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'participants'
      ) AS exists
    `;

    if (exists) {
      for (const file of files) {
        if (file >= LEDGER_START_FILE) continue;
        await db`
          INSERT INTO _schema_migrations (filename)
          VALUES (${file})
        `;
        applied.add(file);
      }
      console.log(
        `Bootstrapped migration ledger (${applied.size} pre-${LEDGER_START_FILE} migrations).`,
      );
    }
  }

  for (const file of files) {
    if (applied.has(file)) {
      console.log("Migration skipped (already applied):", file);
      continue;
    }

    const migration = readFileSync(resolve(dir, file), "utf8");
    await db.unsafe(migration);
    await db`
      INSERT INTO _schema_migrations (filename)
      VALUES (${file})
    `;
    console.log("Migration applied:", file);
  }

  void db.end({ timeout: 0 }).catch(() => undefined);
  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
