import { NextResponse } from "next/server";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { listMeteoraWalletsForAdmin } from "@borneo/lib/meteora/admin-wallets";

export async function GET() {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const wallets = await listMeteoraWalletsForAdmin();
  return NextResponse.json({ wallets });
}
