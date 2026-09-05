import type { Participant } from "@borneo/lib/db/schema";
import { normalizeEmail } from "@borneo/lib/auth/session";

/** Always organizers — merged with ORGANIZER_EMAILS env. */
const BUILTIN_ORGANIZER_EMAILS = ["semi@sendarcade.fun"];

const ORGANIZER_GUEST_IDS = new Set(["staff-han", "staff-marianne", "staff-semi"]);

function organizerEmails(): Set<string> {
  const raw = process.env.ORGANIZER_EMAILS ?? "";
  const emails = [
    ...BUILTIN_ORGANIZER_EMAILS.map((email) => normalizeEmail(email)),
    ...raw
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean),
  ];
  return new Set(emails);
}

/** Semi, Han, Marianne (+ ORGANIZER_EMAILS env) can use admin tools. */
export function isOrganizer(participant: Pick<Participant, "emailNormalized" | "guestId">): boolean {
  if (ORGANIZER_GUEST_IDS.has(participant.guestId)) return true;
  return organizerEmails().has(participant.emailNormalized);
}

export function requireOrganizerApi(participant: Participant | null) {
  if (!participant) {
    return { error: "Sign in required", status: 401 as const };
  }
  if (!isOrganizer(participant)) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { participant };
}
