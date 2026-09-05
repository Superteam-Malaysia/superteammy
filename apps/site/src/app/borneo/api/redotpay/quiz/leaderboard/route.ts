import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import { getRedotPayQuizLeaderboard } from "@borneo/lib/redotpay-quiz/attempt";

export async function GET() {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isOrganizer(participant)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const leaderboard = await getRedotPayQuizLeaderboard();
  return NextResponse.json({ leaderboard });
}
