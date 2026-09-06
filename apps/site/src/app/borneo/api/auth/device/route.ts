import { NextResponse } from "next/server";
import { resolveParticipantFromDeviceToken } from "@borneo/lib/auth/device-token";
import {
  createSessionToken,
  resolveAppOrigin,
  sessionCookieOptions,
  withBasePath,
} from "@borneo/lib/auth/session";

function loginRedirect(error: string, request: Request) {
  const siteOrigin = resolveAppOrigin(new URL(request.url).origin);
  return NextResponse.redirect(`${siteOrigin}${withBasePath("/login")}?error=${error}`);
}

/** Open from Telegram bot (or email) in any browser — sets session + seeds localStorage. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteOrigin = resolveAppOrigin(url.origin);
  const token = url.searchParams.get("token")?.trim();
  if (!token) return loginRedirect("invalid_auth", request);

  const participant = await resolveParticipantFromDeviceToken(token);
  if (!participant) return loginRedirect("invalid_auth", request);

  const sessionToken = await createSessionToken({
    sub: participant.id,
    email: participant.email,
  });

  const profilePath = withBasePath("/profile");
  const response = NextResponse.redirect(
    `${siteOrigin}${profilePath}?device_seed=${encodeURIComponent(token)}`,
  );
  response.cookies.set(sessionCookieOptions(sessionToken));
  return response;
}
