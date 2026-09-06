import { NextResponse } from "next/server";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getMeteoraWalletState, saveMeteoraWallet } from "@borneo/lib/meteora/wallet";

export async function GET() {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const state = await getMeteoraWalletState(participant.id);
  return NextResponse.json(state);
}

export async function PATCH(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { solanaWallet?: unknown };
  const result = await saveMeteoraWallet(
    participant.id,
    body.solanaWallet,
    participant.solanaWallet,
  );

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        solanaWallet: result.solanaWallet,
        locked: result.locked,
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    solanaWallet: result.solanaWallet,
    locked: result.locked,
    balances: result.balances,
  });
}
