#!/usr/bin/env tsx
/**
 * Import Luma guest CSV into Postgres (participants table).
 * Usage: DATABASE_URL=... npm run borneo:db:import-guests [-- path/to/guests.csv]
 *
 * Check-ins: Luma `checked_in_at` is written to participants.checked_in_at
 * (coalesce keeps an earlier local check-in if the CSV cell is empty).
 */
import "dotenv/config";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse";
import { sql } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";

const CSV_DEFAULT = resolve(__dirname, "../../data/imports/guests-2026-09-15.csv");

/** Exact survey headers from the 2026-09-15 Luma export. */
const COL = {
  telegram: "What is your Telegram username?",
  projectIdea:
    "What do you plan to build? Give us a one to two sentence description of your project idea. What problem does it solve and who is it for?",
  proofOfWork:
    "What is your proof of work? Share links to anything that shows you can build - a GitHub repo, a live product, a previous hackathon submission, a Superteam Earn bounty, or anything else that demonstrates you ship. No prior Solana experience required but we want to see that you build.",
  teamSetup: "Do you have a team? What is your team setup?",
  commitmentProof:
    "We ask for either a 5 USDC commitment fee which will be refunded after the event, or proof of travel (plane ticket to KCH). Please send 5 USDC on solana to hanstmy.sol. Then paste the transaction link here. Alternatively, send us a google drive link to a picture of your plane ticket to KCH.",
  jerseySize: "Preferred jersey size",
  ownAccommodation:
    "I do NOT need accommodation in Kuching and have own accommodation arrangements.",
  passportFirst: "First Name as per passport/IC",
  passportLast: "Last Name as per passport/IC",
} as const;

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseDate(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Strip BOM from Luma CSV header keys (often `\\ufeffguest_id`). */
function normalizeRow(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.replace(/^\ufeff/, "").trim()] = value;
  }
  return out;
}

function cell(row: Record<string, string>, header: string): string | null {
  if (header in row) return emptyToNull(row[header]);
  const needle = header.slice(0, 40).toLowerCase();
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase().startsWith(needle)) return emptyToNull(value);
  }
  return null;
}

async function main() {
  const csvPath = resolve(process.argv[2] ?? CSV_DEFAULT);
  console.log(`Importing guests from ${csvPath}`);
  const db = getDb();
  const rows: Record<string, string>[] = [];

  await new Promise<void>((resolvePromise, reject) => {
    createReadStream(csvPath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true }))
      .on("data", (row: Record<string, string>) => rows.push(normalizeRow(row)))
      .on("error", reject)
      .on("end", () => resolvePromise());
  });

  let upserted = 0;
  let checkedIn = 0;
  let approved = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = row.email?.trim();
    const guestId = row.guest_id?.trim();
    if (!email || !guestId) {
      skipped += 1;
      continue;
    }

    const emailNormalized = normalizeEmail(email);
    const checkedInAt = parseDate(row.checked_in_at);
    const approvalStatus = emptyToNull(row.approval_status);
    if (checkedInAt) checkedIn += 1;
    if (approvalStatus === "approved") approved += 1;

    const values = {
      guestId,
      email,
      emailNormalized,
      name: emptyToNull(row.name),
      firstName: emptyToNull(row.first_name),
      lastName: emptyToNull(row.last_name),
      phoneNumber: emptyToNull(row.phone_number),
      lumaCreatedAt: parseDate(row.created_at),
      approvalStatus,
      checkedInAt,
      merchReceivedAt: checkedInAt,
      ticketTypeId: emptyToNull(row.ticket_type_id),
      ticketName: emptyToNull(row.ticket_name),
      passportFirstName: cell(row, COL.passportFirst),
      passportLastName: cell(row, COL.passportLast),
      telegram: cell(row, COL.telegram),
      projectIdea: cell(row, COL.projectIdea),
      proofOfWork: cell(row, COL.proofOfWork),
      teamSetup: cell(row, COL.teamSetup),
      commitmentProof: cell(row, COL.commitmentProof),
      jerseySize: cell(row, COL.jerseySize),
      ownAccommodation: cell(row, COL.ownAccommodation),
      rawRegistration: row,
      updatedAt: new Date(),
    };

    await db
      .insert(participants)
      .values(values)
      .onConflictDoUpdate({
        target: participants.guestId,
        set: {
          ...values,
          checkedInAt: sql`coalesce(excluded.checked_in_at, ${participants.checkedInAt})`,
          merchReceivedAt: sql`coalesce(excluded.merch_received_at, ${participants.merchReceivedAt})`,
          importedAt: sql`now()`,
        },
      });
    upserted += 1;
  }

  console.log(
    `Imported ${upserted} participants (${approved} approved, ${checkedIn} checked in on Luma, ${skipped} skipped) from ${csvPath}`,
  );
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
