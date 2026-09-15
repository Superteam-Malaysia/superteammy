#!/usr/bin/env tsx
/**
 * Delete guests who should not remain in the directory / check-in desk.
 * Usage: DATABASE_URL=... npm run borneo:db:delete-participants
 */
import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants, teams } from "../../src/borneo/lib/db/schema";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";

/** Guests removed from the final Luma list — drop from Postgres entirely. */
const DELETE_EMAILS = [
  "alicegamefi@gmail.com",
  "anishak0106@gmail.com",
  "fahmiiireza@gmail.com",
  "mariamhii@gmail.com",
  "matthaeuschoovastelorde@gmail.com",
].map(normalizeEmail);

/** Solo seed teams owned only by guests above — drop empty leftovers. */
const ORPHAN_TEAM_SLUGS = ["withmiautomation", "circle-of-care"];

async function main() {
  const db = getDb();
  const emails =
    process.argv.slice(2).map((e) => normalizeEmail(e.trim())).filter(Boolean).length > 0
      ? process.argv.slice(2).map((e) => normalizeEmail(e.trim())).filter(Boolean)
      : DELETE_EMAILS;

  const removed = await db
    .delete(participants)
    .where(inArray(participants.emailNormalized, emails))
    .returning({
      name: participants.name,
      email: participants.email,
      guestId: participants.guestId,
    });

  console.log(`Deleted ${removed.length} participant(s):`);
  for (const row of removed) {
    console.log(` - ${row.name} <${row.email}> (${row.guestId})`);
  }

  const missing = emails.filter(
    (email) => !removed.some((row) => normalizeEmail(row.email) === email),
  );
  if (missing.length) {
    console.log("Already absent:", missing.join(", "));
  }

  for (const slug of ORPHAN_TEAM_SLUGS) {
    const gone = await db
      .delete(teams)
      .where(eq(teams.slug, slug))
      .returning({ slug: teams.slug, name: teams.name });
    for (const row of gone) {
      console.log(`Deleted team: ${row.name} (${row.slug})`);
    }
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
