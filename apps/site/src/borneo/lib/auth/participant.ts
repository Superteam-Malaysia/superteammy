import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";
import { getSession } from "@borneo/lib/auth/session";
import { withBasePath } from "@borneo/lib/base-path";

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
