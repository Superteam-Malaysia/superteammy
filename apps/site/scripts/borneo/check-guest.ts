#!/usr/bin/env tsx
/**
 * One-off guest lookup for production debugging.
 * Usage: DATABASE_URL=... npx tsx scripts/borneo/check-guest.ts keeyushee@gmail.com
 */
import "dotenv/config";
import { eq, ilike, or } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";

async function main() {
  const lookup = process.argv[2] ?? "keeyushee@gmail.com";
  const emailNormalized = lookup.includes("@") ? normalizeEmail(lookup) : null;
  const db = getDb();

  const rows = await db
    .select({
      guestId: participants.guestId,
      name: participants.name,
      firstName: participants.firstName,
      lastName: participants.lastName,
      passportFirstName: participants.passportFirstName,
      passportLastName: participants.passportLastName,
      email: participants.email,
      telegram: participants.telegram,
      approvalStatus: participants.approvalStatus,
      checkedInAt: participants.checkedInAt,
    })
    .from(participants)
    .where(
      emailNormalized
        ? or(eq(participants.emailNormalized, emailNormalized), ilike(participants.name, `%${lookup}%`))
        : ilike(participants.name, `%${lookup}%`),
    )
    .limit(10);

  const [countRow] = await db
    .select({ total: participants.id })
    .from(participants);

  console.log(JSON.stringify({ lookup, matches: rows.length, rows }, null, 2));
  console.log("participant_rows_scanned", countRow ? "ok" : "none");

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
