import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import {
  listGuestsForCheckIn,
  updateGuestChecklist,
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
  const merchReceived =
    typeof body === "object" && body && "merchReceived" in body
      ? (body as { merchReceived: unknown }).merchReceived
      : undefined;
  const amazingRaceLeader =
    typeof body === "object" && body && "amazingRaceLeader" in body
      ? (body as { amazingRaceLeader: unknown }).amazingRaceLeader
      : undefined;
  const raceTeamId =
    typeof body === "object" && body && "raceTeamId" in body
      ? (body as { raceTeamId: unknown }).raceTeamId
      : undefined;
  const groupNumber =
    typeof body === "object" && body && "groupNumber" in body
      ? (body as { groupNumber: unknown }).groupNumber
      : undefined;

  if (!participantId) {
    return NextResponse.json({ error: "participantId is required" }, { status: 400 });
  }

  const hasRaceTeamUpdate = raceTeamId !== undefined;
  const hasGroupNumberUpdate = groupNumber !== undefined;
  const normalizedRaceTeamId =
    raceTeamId === null || raceTeamId === ""
      ? null
      : typeof raceTeamId === "string"
        ? raceTeamId
        : undefined;
  const normalizedGroupNumber =
    groupNumber === null || groupNumber === ""
      ? null
      : typeof groupNumber === "number"
        ? groupNumber
        : typeof groupNumber === "string" && groupNumber.trim()
          ? Number.parseInt(groupNumber, 10)
          : undefined;

  if (
    typeof checkedIn !== "boolean" &&
    typeof merchReceived !== "boolean" &&
    typeof amazingRaceLeader !== "boolean" &&
    !hasRaceTeamUpdate &&
    !hasGroupNumberUpdate
  ) {
    return NextResponse.json(
      { error: "No checklist updates provided" },
      { status: 400 },
    );
  }

  if (hasRaceTeamUpdate && normalizedRaceTeamId === undefined) {
    return NextResponse.json({ error: "raceTeamId must be a string or null" }, { status: 400 });
  }

  if (
    hasGroupNumberUpdate &&
    normalizedGroupNumber !== null &&
    (normalizedGroupNumber === undefined || !Number.isFinite(normalizedGroupNumber) || normalizedGroupNumber < 1)
  ) {
    return NextResponse.json({ error: "groupNumber must be a positive integer or null" }, { status: 400 });
  }

  try {
    const guests = await updateGuestChecklist(participantId, {
      ...(typeof checkedIn === "boolean" ? { checkedIn } : {}),
      ...(typeof merchReceived === "boolean" ? { merchReceived } : {}),
      ...(typeof amazingRaceLeader === "boolean" ? { amazingRaceLeader } : {}),
      ...(hasRaceTeamUpdate ? { raceTeamId: normalizedRaceTeamId ?? null } : {}),
      ...(hasGroupNumberUpdate ? { groupNumber: normalizedGroupNumber ?? null } : {}),
    });

    const guest = guests.find((row) => row.id === participantId);
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest, guests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save checklist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
