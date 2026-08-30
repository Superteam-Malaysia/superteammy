import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { listAllRaceSubmissionsForAdmin } from "@borneo/lib/race/submissions";

export async function GET() {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const submissions = await listAllRaceSubmissionsForAdmin();
  return NextResponse.json({ submissions });
}
