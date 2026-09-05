import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getTeamMembership } from "@borneo/lib/teams/access";
import { getTeamRecordBySlug } from "@borneo/lib/teams/public-teams";
import {
  getRaceThreadUrlConflict,
  listParticipantRaceSubmissions,
  upsertParticipantRaceSubmission,
} from "@borneo/lib/race/submissions";
import { validateRaceSubmissionInput } from "@borneo/lib/race/validation";

export async function GET() {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const submissions = await listParticipantRaceSubmissions(participant.id);
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as {
    taskId?: string;
    threadUrl?: string;
    teamSlug?: string | null;
  };

  const validation = validateRaceSubmissionInput(body.taskId ?? "", body.threadUrl ?? "");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let teamId: string | null = null;
  if (body.teamSlug) {
    const record = await getTeamRecordBySlug(body.teamSlug);
    if (!record) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    const membership = await getTeamMembership(record.id, participant.id);
    if (!membership) {
      return NextResponse.json({ error: "You are not on that team." }, { status: 403 });
    }
    teamId = record.id;
  }

  const duplicate = await getRaceThreadUrlConflict({
    participantId: participant.id,
    taskId: validation.taskId,
    threadUrl: validation.threadUrl,
  });
  if (duplicate) {
    return NextResponse.json({ error: duplicate }, { status: 409 });
  }

  const row = await upsertParticipantRaceSubmission({
    participantId: participant.id,
    taskId: validation.taskId,
    threadUrl: validation.threadUrl,
    teamId,
  });

  return NextResponse.json({
    submission: {
      id: row.id,
      taskId: row.taskId,
      threadUrl: row.threadUrl,
      submittedAt: row.submittedAt.toISOString(),
    },
  });
}
