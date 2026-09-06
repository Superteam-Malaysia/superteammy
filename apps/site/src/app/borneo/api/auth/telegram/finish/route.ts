import { NextResponse } from "next/server";
import {
  createSessionToken,
  resolveAppOrigin,
  sessionCookieOptions,
  withBasePath,
} from "@borneo/lib/auth/session";
import { consumeTelegramFinishToken } from "@borneo/lib/auth/telegram-bot-login";

function loginRedirect(error: string, request: Request) {
  const siteOrigin = resolveAppOrigin(new URL(request.url).origin);
  return NextResponse.redirect(`${siteOrigin}${withBasePath("/login")}?error=${error}`);
}

export async function GET(request: Request) {
  const siteOrigin = resolveAppOrigin(new URL(request.url).origin);
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return loginRedirect("invalid_auth", request);

  const participant = await consumeTelegramFinishToken(token);
  if (!participant) return loginRedirect("invalid_auth", request);

  const sessionToken = await createSessionToken({
    sub: participant.id,
    email: participant.email,
  });

  const response = NextResponse.redirect(`${siteOrigin}${withBasePath("/profile")}`);
  response.cookies.set(sessionCookieOptions(sessionToken));
  return response;
}
