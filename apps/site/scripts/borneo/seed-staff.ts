#!/usr/bin/env tsx
/**
 * Seed staff / mentor accounts that are not in the Luma guest export.
 * Ensures every mentors-directory person appears on the organizer check-in list.
 *
 * Usage: DATABASE_URL=... npm run borneo:db:seed-staff
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { getPublicMentors, mentorTelegramHandle } from "../../src/borneo/data/mentors";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";

const ORGANIZER_IDS = new Set(["han", "marianne", "semi"]);

function staffEmail(mentorId: string, email: string | null): string {
  if (email?.trim()) return email.trim();
  return `staff+${mentorId}@svb.local`;
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

function matchesGuestName(mentorName: string, guestName: string | null): boolean {
  const needle = mentorName.toLowerCase().trim();
  const haystack = (guestName ?? "").toLowerCase().trim();
  if (!needle || !haystack) return false;
  return haystack === needle || haystack.startsWith(`${needle} `) || haystack.startsWith(`${needle}|`);
}

async function main() {
  const db = getDb();
  const mentors = getPublicMentors();

  const guestRows = await db
    .select({ guestId: participants.guestId, name: participants.name })
    .from(participants);

  let seeded = 0;
  let skipped = 0;

  for (const mentor of mentors) {
    const guestId = `staff-${mentor.id}`;
    const alreadyGuest = guestRows.some(
      (row) => !row.guestId.startsWith("staff-") && matchesGuestName(mentor.name, row.name),
    );

    if (alreadyGuest) {
      console.log(`Skipped staff seed (Luma guest exists): ${mentor.name}`);
      skipped += 1;
      continue;
    }

    const email = staffEmail(mentor.id, mentor.email);
    const emailNormalized = normalizeEmail(email);
    const isOrganizer = ORGANIZER_IDS.has(mentor.id);
    const roleLabel = isOrganizer ? "Organizer" : "Mentor";
    const workshopTitles = mentor.workshops.map((workshop) => workshop.title).join(" · ");
    const projectIdea =
      workshopTitles ||
      `${roleLabel} · ${mentor.organization ?? "Startup Village Borneo"}`;

    const values = {
      guestId,
      email,
      emailNormalized,
      name: mentor.name,
      firstName: mentor.name.split(/\s+/)[0] ?? mentor.name,
      lastName: mentor.name.split(/\s+/).slice(1).join(" ") || null,
      telegram: mentorTelegramUrl(mentor),
      ticketName: roleLabel,
      projectIdea,
      proofOfWork: mentor.organization ?? null,
      teamSetup: mentor.organization ?? "Startup Village Borneo",
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

    console.log(`Seeded staff: ${mentor.name} · ${guestId} · ${email}`);
    seeded += 1;
  }

  console.log(`Staff seed done — ${seeded} upserted, ${skipped} skipped (already in Luma export).`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
