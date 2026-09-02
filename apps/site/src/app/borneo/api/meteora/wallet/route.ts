import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";
import {
  isValidSolanaWallet,
  normalizeSolanaWallet,
} from "@borneo/lib/profile/wallet";

export async function PATCH(request: Request) {
  const participant = await getParticipantForSession();
  if (!participant) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { solanaWallet?: unknown };
  const solanaWallet =
    typeof body.solanaWallet === "string"
      ? normalizeSolanaWallet(body.solanaWallet).slice(0, 64)
      : "";

  if (!solanaWallet) {
    return NextResponse.json({ error: "Wallet address is required." }, { status: 400 });
  }

  if (!isValidSolanaWallet(solanaWallet)) {
    return NextResponse.json(
      { error: "Enter a valid Solana wallet (base58, from Phantom, Solflare, etc.)." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [updated] = await db
    .update(participants)
    .set({ solanaWallet, updatedAt: new Date() })
    .where(eq(participants.id, participant.id))
    .returning({ solanaWallet: participants.solanaWallet });

  if (!updated) {
    return NextResponse.json({ error: "Could not save wallet." }, { status: 500 });
  }

  return NextResponse.json({ solanaWallet: updated.solanaWallet });
}
