import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getTeamMembership } from "@borneo/lib/teams/access";
import { getTeamRecordBySlug } from "@borneo/lib/teams/public-teams";
import {
  getRaceThreadUrlConflict,
  insertParticipantRaceSubmission,
  listParticipantRaceSubmissions,
} from "@borneo/lib/race/submissions";
import { validateRaceSubmissionInput } from "@borneo/lib/race/validation";

type Params = { params: Promise<{ slug: string }> };

/** Legacy team URL — milestones are per person; slug only selects optional team tag. */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const record = await getTeamRecordBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const membership = await getTeamMembership(record.id, participant.id);
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await listParticipantRaceSubmissions(participant.id);
  return NextResponse.json({ submissions });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const record = await getTeamRecordBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const membership = await getTeamMembership(record.id, participant.id);
  if (!membership) {
    return NextResponse.json({ error: "You must be on this team to tag it." }, { status: 403 });
  }

  const body = (await request.json()) as { taskId?: string; threadUrl?: string };
  const validation = validateRaceSubmissionInput(body.taskId ?? "", body.threadUrl ?? "");
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const duplicate = await getRaceThreadUrlConflict({
    participantId: participant.id,
    taskId: validation.taskId,
    threadUrl: validation.threadUrl,
  });
  if (duplicate) {
    return NextResponse.json({ error: duplicate }, { status: 409 });
  }

  const row = await insertParticipantRaceSubmission({
    participantId: participant.id,
    taskId: validation.taskId,
    threadUrl: validation.threadUrl,
    teamId: record.id,
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
