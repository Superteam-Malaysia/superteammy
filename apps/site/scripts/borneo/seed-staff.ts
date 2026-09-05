#!/usr/bin/env tsx
/**
 * Seed organizer staff accounts that are not in the Luma guest export.
 * Only Semi, Han, and Marianne — mentors/judges are not staff check-in rows.
 *
 * Usage: DATABASE_URL=... npm run borneo:db:seed-staff
 */
import "dotenv/config";
import { and, like, notInArray, sql } from "drizzle-orm";
import { getPublicMentors, mentorTelegramHandle } from "../../src/borneo/data/mentors";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";

const STAFF_IDS = new Set(["han", "marianne", "semi"]);
const STAFF_GUEST_IDS = [...STAFF_IDS].map((id) => `staff-${id}`);

function staffEmail(staffId: string, email: string | null): string {
  if (email?.trim()) return email.trim();
  return `staff+${staffId}@svb.local`;
}

function telegramHref(value: string | null): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return handle ? `https://t.me/${handle}` : null;
}

function mentorTelegramUrl(mentor: ReturnType<typeof getPublicMentors>[number]): string | null {
  return telegramHref(mentorTelegramHandle(mentor));
}

function matchesGuestName(staffName: string, guestName: string | null): boolean {
  const needle = staffName.toLowerCase().trim();
  const haystack = (guestName ?? "").toLowerCase().trim();
  if (!needle || !haystack) return false;
  return haystack === needle || haystack.startsWith(`${needle} `) || haystack.startsWith(`${needle}|`);
}

async function removeMentorStaffRows(db: ReturnType<typeof getDb>) {
  const stray = await db
    .select({ guestId: participants.guestId, name: participants.name })
    .from(participants)
    .where(and(like(participants.guestId, "staff-%"), notInArray(participants.guestId, STAFF_GUEST_IDS)));

  if (stray.length === 0) return 0;

  await db
    .delete(participants)
    .where(and(like(participants.guestId, "staff-%"), notInArray(participants.guestId, STAFF_GUEST_IDS)));

  for (const row of stray) {
    console.log(`Removed non-staff row: ${row.name} · ${row.guestId}`);
  }

  return stray.length;
}

async function main() {
  const db = getDb();
  const staff = getPublicMentors().filter((mentor) => STAFF_IDS.has(mentor.id));

  const guestRows = await db
    .select({ guestId: participants.guestId, name: participants.name })
    .from(participants);

  const removed = await removeMentorStaffRows(db);

  let seeded = 0;
  let skipped = 0;

  for (const person of staff) {
    const guestId = `staff-${person.id}`;
    const alreadyGuest = guestRows.some(
      (row) => !row.guestId.startsWith("staff-") && matchesGuestName(person.name, row.name),
    );

    if (alreadyGuest) {
      console.log(`Skipped staff seed (Luma guest exists): ${person.name}`);
      skipped += 1;
      continue;
    }

    const email = staffEmail(person.id, person.email);
    const emailNormalized = normalizeEmail(email);
    const projectIdea = `${person.organization ?? "Superteam Malaysia"} · Startup Village Borneo organizer`;

    const values = {
      guestId,
      email,
      emailNormalized,
      name: person.name,
      firstName: person.name.split(/\s+/)[0] ?? person.name,
      lastName: person.name.split(/\s+/).slice(1).join(" ") || null,
      telegram: mentorTelegramUrl(person),
      ticketName: "Organizer",
      projectIdea,
      proofOfWork: person.organization ?? null,
      teamSetup: person.organization ?? "Superteam Malaysia",
      approvalStatus: "approved",
      updatedAt: new Date(),
    };

    await db
      .insert(participants)
      .values(values)
      .onConflictDoUpdate({
        target: participants.guestId,
        set: {
          name: values.name,
          firstName: values.firstName,
          lastName: values.lastName,
          telegram: values.telegram,
          ticketName: values.ticketName,
          projectIdea: values.projectIdea,
          proofOfWork: values.proofOfWork,
          teamSetup: values.teamSetup,
          approvalStatus: values.approvalStatus,
          updatedAt: sql`now()`,
        },
      });

    console.log(`Seeded staff: ${person.name} · ${guestId} · ${email}`);
    seeded += 1;
  }

  console.log(
    `Staff seed done — ${seeded} upserted, ${skipped} skipped (Luma guest), ${removed} mentor rows removed.`,
  );
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
