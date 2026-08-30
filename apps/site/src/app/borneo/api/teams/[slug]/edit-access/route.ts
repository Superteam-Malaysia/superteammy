import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { canEditTeam, getTeamMembership } from "@borneo/lib/teams/access";
import { getTeamRecordBySlug } from "@borneo/lib/teams/public-teams";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ canEdit: false });
  }

  const record = await getTeamRecordBySlug(slug);
  if (!record) {
    return NextResponse.json({ canEdit: false }, { status: 404 });
  }

  const membership = await getTeamMembership(record.id, participant.id);
  return NextResponse.json({ canEdit: canEditTeam(membership?.role) });
}
