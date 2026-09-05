import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { listGuestsForCheckIn, updateGuestChecklist } from "@borneo/lib/checkin/admin";

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
  const merchReceived =
    typeof body === "object" && body && "merchReceived" in body
      ? (body as { merchReceived: unknown }).merchReceived
      : undefined;
  const amazingRaceLeader =
    typeof body === "object" && body && "amazingRaceLeader" in body
      ? (body as { amazingRaceLeader: unknown }).amazingRaceLeader
      : undefined;

  if (!participantId) {
    return NextResponse.json({ error: "participantId is required" }, { status: 400 });
  }

  if (
    typeof checkedIn !== "boolean" &&
    typeof merchReceived !== "boolean" &&
    typeof amazingRaceLeader !== "boolean"
  ) {
    return NextResponse.json(
      { error: "checkedIn, merchReceived, and/or amazingRaceLeader must be boolean" },
      { status: 400 },
    );
  }

  const guests = await updateGuestChecklist(participantId, {
    ...(typeof checkedIn === "boolean" ? { checkedIn } : {}),
    ...(typeof merchReceived === "boolean" ? { merchReceived } : {}),
    ...(typeof amazingRaceLeader === "boolean" ? { amazingRaceLeader } : {}),
  });

  const guest = guests.find((row) => row.id === participantId);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  return NextResponse.json({ guest, guests });
}
