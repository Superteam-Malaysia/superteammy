import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getParticipantQuizAttempt } from "@borneo/lib/redotpay-quiz/attempt";

export async function GET() {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const attempt = await getParticipantQuizAttempt(participant.id);
  return NextResponse.json({ attempt });
}
