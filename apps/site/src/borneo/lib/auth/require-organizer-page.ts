import { notFound } from "next/navigation";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";

/** Server pages under /admin — Semi, Han, Marianne only. */
export async function requireOrganizerPage() {
  const participant = await getParticipantForSession();
  if (!participant || !isOrganizer(participant)) notFound();
  return participant;
}
