import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { deviceAuthTokens, participants, type Participant } from "@borneo/lib/db/schema";
import { createMagicToken, hashToken } from "@borneo/lib/auth/session";

export const DEVICE_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export async function issueDeviceAuthToken(participantId: string): Promise<string> {
  const db = getDb();
  const token = createMagicToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + DEVICE_TOKEN_TTL_MS);

  await db.insert(deviceAuthTokens).values({
    participantId,
    tokenHash,
    expiresAt,
  });

  return token;
}

export async function resolveParticipantFromDeviceToken(
  token: string,
): Promise<Participant | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const db = getDb();
  const tokenHash = hashToken(trimmed);
  const now = new Date();

  const [row] = await db
    .select()
    .from(deviceAuthTokens)
    .where(
      and(
        eq(deviceAuthTokens.tokenHash, tokenHash),
        gt(deviceAuthTokens.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, row.participantId))
    .limit(1);

  if (!participant) return null;

  await db
    .update(deviceAuthTokens)
    .set({ lastUsedAt: now })
    .where(eq(deviceAuthTokens.id, row.id));

  return participant;
}

export async function revokeDeviceAuthTokens(participantId: string): Promise<void> {
  const db = getDb();
  await db
    .delete(deviceAuthTokens)
    .where(eq(deviceAuthTokens.participantId, participantId));
}
