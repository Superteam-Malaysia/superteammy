import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { submitRedotPayQuizAnswer } from "@borneo/lib/redotpay-quiz/submit";

export async function POST(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { questionId?: unknown; answer?: unknown };
  const questionId = typeof body.questionId === "string" ? body.questionId : "";

  const result = await submitRedotPayQuizAnswer(participant.id, questionId, body.answer);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
