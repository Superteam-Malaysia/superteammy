import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { createRaceTeam } from "@borneo/lib/checkin/admin";

export async function POST(request: Request) {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    typeof body === "object" && body && "name" in body
      ? String((body as { name: unknown }).name ?? "")
      : "";

  try {
    const raceTeam = await createRaceTeam(name);
    return NextResponse.json({ raceTeam });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create ops group.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
