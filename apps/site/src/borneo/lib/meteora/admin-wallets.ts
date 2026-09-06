import { desc, sql } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants } from "@borneo/lib/db/schema";

export type MeteoraWalletRow = {
  participantId: string;
  name: string;
  email: string;
  solanaWallet: string;
  updatedAt: string;
};

export async function listMeteoraWalletsForAdmin(): Promise<MeteoraWalletRow[]> {
  if (!process.env.DATABASE_URL) return [];

  const db = getDb();
  const rows = await db
    .select({
      participantId: participants.id,
      name: participants.name,
      email: participants.email,
      solanaWallet: participants.solanaWallet,
      updatedAt: participants.updatedAt,
    })
    .from(participants)
    .where(sql`${participants.solanaWallet} is not null and trim(${participants.solanaWallet}) <> ''`)
    .orderBy(desc(participants.updatedAt));

  return rows.map((row) => ({
    participantId: row.participantId,
    name: row.name?.trim() || row.email,
    email: row.email,
    solanaWallet: row.solanaWallet!.trim(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}
