import { asc, eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";

export type CheckInGuest = {
  id: string;
  guestId: string;
  name: string;
  email: string;
  telegram: string | null;
  ticketName: string | null;
  approvalStatus: string | null;
  checkedInAt: string | null;
};

function displayName(row: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const fromParts = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.name?.trim() || fromParts || row.email;
}

function mapRow(row: {
  id: string;
  guestId: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  telegram: string | null;
  ticketName: string | null;
  approvalStatus: string | null;
  checkedInAt: Date | null;
}): CheckInGuest {
  return {
    id: row.id,
    guestId: row.guestId,
    name: displayName(row),
    email: row.email,
    telegram: row.telegram,
    ticketName: row.ticketName,
    approvalStatus: row.approvalStatus,
    checkedInAt: row.checkedInAt?.toISOString() ?? null,
  };
}

const checkInSelect = {
  id: participants.id,
  guestId: participants.guestId,
  name: participants.name,
  firstName: participants.firstName,
  lastName: participants.lastName,
  email: participants.email,
  telegram: participants.telegram,
  ticketName: participants.ticketName,
  approvalStatus: participants.approvalStatus,
  checkedInAt: participants.checkedInAt,
};

export async function listGuestsForCheckIn(): Promise<CheckInGuest[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select(checkInSelect)
    .from(participants)
    .orderBy(asc(participants.name), asc(participants.email));

  return rows.map(mapRow);
}

export async function getGuestForCheckIn(participantId: string): Promise<CheckInGuest | null> {
  if (!process.env.DATABASE_URL) return null;

  const db = getDb();
  const [row] = await db
    .select(checkInSelect)
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  return row ? mapRow(row) : null;
}

export async function setGuestCheckIn(participantId: string, checkedIn: boolean): Promise<void> {
  const db = getDb();
  await db
    .update(participants)
    .set({
      checkedInAt: checkedIn ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(participants.id, participantId));
}
