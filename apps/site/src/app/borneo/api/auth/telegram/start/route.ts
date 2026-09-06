import { NextResponse } from "next/server";
import { lookupTelegramBot } from "@borneo/lib/auth/telegram";
import { createTelegramAppLoginSession } from "@borneo/lib/auth/telegram-bot-login";
import { appOrigin, resolveAppOrigin } from "@borneo/lib/auth/session";

function loginOriginFromRequest(request: Request): string {
  const origin = request.headers.get("origin")?.trim();
  if (origin) return resolveAppOrigin(origin);

  const referer = request.headers.get("referer")?.trim();
  if (referer) {
    try {
      return resolveAppOrigin(new URL(referer).origin);
    } catch {
      /* fall through */
    }
  }

  return appOrigin();
}

export async function POST(request: Request) {
  const lookup = await lookupTelegramBot();
  if (!lookup.ok) {
    return NextResponse.json({ error: "Telegram is not configured" }, { status: 503 });
  }

  const session = await createTelegramAppLoginSession(
    lookup.bot.username,
    loginOriginFromRequest(request),
  );

  return NextResponse.json({
    deepLink: session.deepLink,
    desktopDeepLink: session.desktopDeepLink,
    pollToken: session.startToken,
    expiresAt: session.expiresAt.toISOString(),
  });
}
