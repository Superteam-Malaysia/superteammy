import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { submitRedotPayQuizAttempt } from "@borneo/lib/redotpay-quiz/attempt";

export async function POST(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { attemptId?: unknown; answers?: unknown };
  const attemptId = typeof body.attemptId === "string" ? body.attemptId : "";

  const result = await submitRedotPayQuizAttempt(participant.id, attemptId, body.answers);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
