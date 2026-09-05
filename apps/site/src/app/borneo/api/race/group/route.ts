import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import {
  becomeRaceGroupLeader,
  getParticipantRaceGroup,
  joinRaceGroup,
  leaveRaceGroup,
} from "@borneo/lib/race/groups";

export async function GET() {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const group = await getParticipantRaceGroup(participant.id);
  return NextResponse.json({ group });
}

export async function PATCH(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action =
    typeof body === "object" && body && "action" in body
      ? String((body as { action: unknown }).action ?? "")
      : "";
  const groupNumber =
    typeof body === "object" && body && "groupNumber" in body
      ? (body as { groupNumber: unknown }).groupNumber
      : undefined;

  try {
    if (action === "becomeLeader") {
      const group = await becomeRaceGroupLeader(participant.id);
      return NextResponse.json({ group });
    }

    if (action === "leave") {
      const group = await leaveRaceGroup(participant.id);
      return NextResponse.json({ group });
    }

    if (groupNumber !== undefined) {
      const normalized =
        groupNumber === null || groupNumber === ""
          ? null
          : typeof groupNumber === "number"
            ? groupNumber
            : typeof groupNumber === "string"
              ? Number.parseInt(groupNumber, 10)
              : undefined;

      if (normalized === null) {
        const group = await leaveRaceGroup(participant.id);
        return NextResponse.json({ group });
      }

      if (normalized === undefined || !Number.isFinite(normalized) || normalized < 1) {
        return NextResponse.json({ error: "Pick a valid group number." }, { status: 400 });
      }

      const group = await joinRaceGroup(participant.id, normalized);
      return NextResponse.json({ group });
    }

    return NextResponse.json({ error: "No group update provided." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update group.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
