#!/usr/bin/env tsx
/**
 * Force-check-in approved guests by email (arrival desk).
 * Usage: DATABASE_URL=... npx tsx scripts/borneo/checkin-emails.ts email1 email2 ...
 * Or: CHECKIN_EMAILS=a@x.com,b@y.com npx tsx scripts/borneo/checkin-emails.ts
 */
import "dotenv/config";
import { inArray, sql } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";

const DEFAULT_EMAILS = [
  "st.aaronagai@gmail.com",
  "abdazharee@gmail.com",
  "ariah.luma@mvn.xyz",
  "justthur111@gmail.com",
  "cheryl.l@pudgypenguins.io",
  "brandonkongbk@gmail.com",
  "dominique@reifydb.com",
  "dr.frankenmiller@gmail.com",
  "jacob.k@superscrypt.xyz",
  "lisa.bechina@gmail.com",
  "marcusyeokh2796@gmail.com",
  "devwannabe420@gmail.com",
  "luuminhquyen610@gmail.com",
  "huaipoh@gmail.com",
  "nicfuryyy@gmail.com",
];

async function main() {
  const fromEnv = (process.env.CHECKIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const fromArgs = process.argv.slice(2).map((e) => e.trim()).filter(Boolean);
  const emails = (fromArgs.length ? fromArgs : fromEnv.length ? fromEnv : DEFAULT_EMAILS).map(
    normalizeEmail,
  );

  const db = getDb();
  const now = new Date();

  const updated = await db
    .update(participants)
    .set({
      checkedInAt: now,
      merchReceivedAt: sql`coalesce(${participants.merchReceivedAt}, now())`,
      updatedAt: now,
    })
    .where(inArray(participants.emailNormalized, emails))
    .returning({
      name: participants.name,
      email: participants.email,
      checkedInAt: participants.checkedInAt,
    });

  console.log(`Checked in ${updated.length} / ${emails.length} emails:`);
  for (const row of updated) {
    console.log(` - ${row.name} <${row.email}> @ ${row.checkedInAt?.toISOString()}`);
  }

  const missing = emails.filter(
    (email) => !updated.some((row) => normalizeEmail(row.email) === email),
  );
  if (missing.length) {
    console.warn("No participant row for:", missing.join(", "));
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
