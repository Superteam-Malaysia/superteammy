import { NextResponse } from "next/server";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { listMeteoraWalletsWithBalancesForAdmin } from "@borneo/lib/meteora/admin-wallets-export";

export const maxDuration = 300;

export async function GET() {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const wallets = await listMeteoraWalletsWithBalancesForAdmin();
  return NextResponse.json({ wallets });
}
