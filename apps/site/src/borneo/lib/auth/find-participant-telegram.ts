import { eq, isNotNull } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, type Participant } from "@borneo/lib/db/schema";
import { normalizeTelegramUsername } from "@borneo/lib/auth/telegram";

export async function findParticipantByTelegramUserId(
  telegramUserId: string,
): Promise<Participant | null> {
  const db = getDb();
  const [linked] = await db
    .select()
    .from(participants)
    .where(eq(participants.telegramUserId, telegramUserId))
    .limit(1);
  return linked ?? null;
}

export async function findParticipantByTelegramUsername(
  authUsername: string,
): Promise<Participant | null> {
  const db = getDb();
  const registered = await db
    .select()
    .from(participants)
    .where(isNotNull(participants.telegram));

  return (
    registered.find(
      (row) => normalizeTelegramUsername(row.telegram) === authUsername,
    ) ?? null
  );
}

export async function resolveParticipantForTelegramAuth(params: {
  telegramUserId: string;
  authUsername: string | null;
}): Promise<Participant | null> {
  const linked = await findParticipantByTelegramUserId(params.telegramUserId);
  if (linked) return linked;
  if (!params.authUsername) return null;
  return findParticipantByTelegramUsername(params.authUsername);
}
