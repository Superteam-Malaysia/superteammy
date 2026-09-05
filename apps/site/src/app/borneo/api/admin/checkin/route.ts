import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import {
  getGuestForCheckIn,
  listGuestsForCheckIn,
  setGuestCheckIn,
} from "@borneo/lib/checkin/admin";

export async function GET() {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const guests = await listGuestsForCheckIn();
  return NextResponse.json({ guests });
}

export async function PATCH(request: Request) {
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

  const participantId =
    typeof body === "object" && body && "participantId" in body
      ? String((body as { participantId: unknown }).participantId ?? "")
      : "";
  const checkedIn =
    typeof body === "object" && body && "checkedIn" in body
      ? (body as { checkedIn: unknown }).checkedIn
      : undefined;

  if (!participantId || typeof checkedIn !== "boolean") {
    return NextResponse.json({ error: "participantId and checkedIn are required" }, { status: 400 });
  }

  await setGuestCheckIn(participantId, checkedIn);
  const guest = await getGuestForCheckIn(participantId);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
