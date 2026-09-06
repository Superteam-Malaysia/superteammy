import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";
import {
  isValidSolanaWallet,
  normalizeSolanaWallet,
} from "@borneo/lib/profile/wallet";
import { fetchWalletBalances, type WalletBalances } from "@borneo/lib/solana/wallet-balances";

export type MeteoraWalletState = {
  solanaWallet: string | null;
  locked: boolean;
  balances: WalletBalances | null;
};

export async function getMeteoraWalletState(participantId: string): Promise<MeteoraWalletState> {
  const db = getDb();
  const [row] = await db
    .select({ solanaWallet: participants.solanaWallet })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  const solanaWallet = row?.solanaWallet?.trim() || null;
  if (!solanaWallet) {
    return { solanaWallet: null, locked: false, balances: null };
  }

  let balances: WalletBalances | null = null;
  try {
    balances = await fetchWalletBalances(solanaWallet);
  } catch {
    balances = null;
  }

  return { solanaWallet, locked: true, balances };
}

export type SaveMeteoraWalletResult =
  | { ok: true; solanaWallet: string; locked: true; balances: WalletBalances | null }
  | { ok: false; error: string; status: number; solanaWallet?: string; locked?: boolean };

export async function saveMeteoraWallet(
  participantId: string,
  rawWallet: unknown,
  existingWallet: string | null | undefined,
): Promise<SaveMeteoraWalletResult> {
  const current = existingWallet?.trim() || null;
  if (current) {
    return {
      ok: false,
      error: "Wallet already locked in — it cannot be changed.",
      status: 409,
      solanaWallet: current,
      locked: true,
    };
  }

  const solanaWallet =
    typeof rawWallet === "string" ? normalizeSolanaWallet(rawWallet).slice(0, 64) : "";

  if (!solanaWallet) {
    return { ok: false, error: "Wallet address is required.", status: 400 };
  }

  if (!isValidSolanaWallet(solanaWallet)) {
    return {
      ok: false,
      error: "Enter a valid Solana wallet (base58, from Phantom, Solflare, etc.).",
      status: 400,
    };
  }

  const db = getDb();
  const [updated] = await db
    .update(participants)
    .set({ solanaWallet, updatedAt: new Date() })
    .where(and(eq(participants.id, participantId), isNull(participants.solanaWallet)))
    .returning({ solanaWallet: participants.solanaWallet });

  if (!updated?.solanaWallet) {
    const [row] = await db
      .select({ solanaWallet: participants.solanaWallet })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);
    const lockedWallet = row?.solanaWallet?.trim() || null;
    if (lockedWallet) {
      return {
        ok: false,
        error: "Wallet already locked in — it cannot be changed.",
        status: 409,
        solanaWallet: lockedWallet,
        locked: true,
      };
    }
    return { ok: false, error: "Could not save wallet.", status: 500 };
  }

  let balances: WalletBalances | null = null;
  try {
    balances = await fetchWalletBalances(updated.solanaWallet);
  } catch {
    balances = null;
  }

  return {
    ok: true,
    solanaWallet: updated.solanaWallet,
    locked: true,
    balances,
  };
}
