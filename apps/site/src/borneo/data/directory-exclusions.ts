/**
 * Non-builder ops people who registered via Luma but should not appear in
 * the public teams / builders directory (media, A/V, etc.).
 */
const HIDDEN_DIRECTORY_EMAILS = new Set(["ric@my.littleunusual.com"]);

const HIDDEN_DIRECTORY_TELEGRAMS = new Set(["ricnishraj"]);

function normalizeHandle(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  let cleaned = value.trim();
  cleaned = cleaned.replace(/^https?:\/\/(t\.me|telegram\.me|x\.com|twitter\.com)\//i, "");
  cleaned = cleaned.replace(/^@/, "");
  cleaned = cleaned.split(/[/?#]/)[0] ?? cleaned;
  const compact = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
  return compact || null;
}

/** True for media / ops staff who should stay out of builder listings. */
export function isHiddenDirectoryParticipant(person: {
  email?: string | null;
  telegram?: string | null;
}): boolean {
  const email = person.email?.trim().toLowerCase();
  if (email && HIDDEN_DIRECTORY_EMAILS.has(email)) return true;
  const telegram = normalizeHandle(person.telegram);
  if (telegram && HIDDEN_DIRECTORY_TELEGRAMS.has(telegram)) return true;
  return false;
}
