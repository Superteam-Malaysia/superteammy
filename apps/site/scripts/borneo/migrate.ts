#!/usr/bin/env tsx
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

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
