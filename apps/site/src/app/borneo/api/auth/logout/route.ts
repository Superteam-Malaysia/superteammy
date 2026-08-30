import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@borneo/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
