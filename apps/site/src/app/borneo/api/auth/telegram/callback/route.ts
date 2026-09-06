import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";
import { resolveParticipantForTelegramAuth } from "@borneo/lib/auth/find-participant-telegram";
import { issueParticipantSession } from "@borneo/lib/auth/issue-session";
import {
  resolveAppOrigin,
  sessionCookieOptions,
  withBasePath,
} from "@borneo/lib/auth/session";
import {
  normalizeTelegramUsername,
  verifyTelegramAuth,
} from "@borneo/lib/auth/telegram";

function loginRedirect(error: string, request: Request) {
  const siteOrigin = resolveAppOrigin(new URL(request.url).origin);
  return NextResponse.redirect(`${siteOrigin}${withBasePath("/login")}?error=${error}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, string> = {};
  for (const key of ["id", "first_name", "last_name", "username", "photo_url", "auth_date", "hash"]) {
    const value = searchParams.get(key);
    if (value) payload[key] = value;
  }

  let auth;
  try {
    auth = verifyTelegramAuth(payload);
  } catch {
    return loginRedirect("bot_not_configured", request);
  }

  if (!auth) {
    return loginRedirect("invalid_auth", request);
  }

  const telegramUserId = String(auth.id);
  const authUsername = normalizeTelegramUsername(auth.username);
  const db = getDb();

  const participant = await resolveParticipantForTelegramAuth({
    telegramUserId,
    authUsername,
  });

  if (!participant) {
    return loginRedirect(authUsername ? "not_registered" : "missing_telegram", request);
  }

  if (participant.telegramUserId !== telegramUserId) {
    await db
      .update(participants)
      .set({ telegramUserId, updatedAt: new Date() })
      .where(eq(participants.id, participant.id));
  }

  const { sessionToken, deviceToken } = await issueParticipantSession({
    id: participant.id,
    email: participant.email,
  });

  const siteOrigin = resolveAppOrigin(new URL(request.url).origin);
  const profilePath = withBasePath("/profile");
  const response = NextResponse.redirect(
    `${siteOrigin}${profilePath}?device_seed=${encodeURIComponent(deviceToken)}`,
  );
  response.cookies.set(sessionCookieOptions(sessionToken));
  return response;
}
