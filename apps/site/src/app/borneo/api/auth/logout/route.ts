import { NextResponse } from "next/server";
import { revokeDeviceAuthTokens } from "@borneo/lib/auth/device-token";
import { clearSessionCookieOptions, getSession } from "@borneo/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (session) {
    await revokeDeviceAuthTokens(session.sub);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
