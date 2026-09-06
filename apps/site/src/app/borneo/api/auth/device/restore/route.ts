import { NextResponse } from "next/server";
import { resolveParticipantFromDeviceToken } from "@borneo/lib/auth/device-token";
import { createSessionToken, sessionCookieOptions } from "@borneo/lib/auth/session";

/** Restore httpOnly session from a device token stored in localStorage. */
export async function POST(request: Request) {
  let token = "";
  try {
    const body = (await request.json()) as { token?: string };
    token = body.token?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  const participant = await resolveParticipantFromDeviceToken(token);
  if (!participant) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const sessionToken = await createSessionToken({
    sub: participant.id,
    email: participant.email,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions(sessionToken));
  return response;
}
