import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, type Participant } from "@borneo/lib/db/schema";
import { getSession } from "@borneo/lib/auth/session";
import { withBasePath } from "@borneo/lib/base-path";

/** Participant fields safe to return from session APIs — excludes organizer ops data. */
export type SessionParticipant = Omit<
  Participant,
  "rawRegistration" | "checkedInAt" | "merchReceivedAt" | "amazingRaceLeader" | "raceTeamId"
>;

export function toSessionParticipant(participant: Participant): SessionParticipant {
  const {
    rawRegistration: _raw,
    checkedInAt: _checkedIn,
    merchReceivedAt: _merch,
    amazingRaceLeader: _leader,
    raceTeamId: _raceTeam,
    ...safe
  } = participant;
  return safe;
}

export async function getParticipantForSession() {
  const session = await getSession();
  if (!session) return null;

  const db = getDb();
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, session.sub))
    .limit(1);
  return participant ?? null;
}

export async function requireParticipant() {
  const participant = await getParticipantForSession();
  if (!participant) {
    redirect(withBasePath("/login"));
  }
  return participant;
}
