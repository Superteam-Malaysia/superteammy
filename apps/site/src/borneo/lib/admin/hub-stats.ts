import { sql } from "drizzle-orm";
import { getDb } from "@borneo/lib/db";
import { participants, raceSubmissions, redotpayQuizAttempts } from "@borneo/lib/db/schema";

export type AdminHubStats = {
  checkIn: { approved: number; checkedIn: number; merchReceived: number };
  raceSubmissions: number;
  redotPayQuizCompleted: number;
  meteoraWallets: number;
};

export async function getAdminHubStats(): Promise<AdminHubStats> {
  if (!process.env.DATABASE_URL) {
    return {
      checkIn: { approved: 0, checkedIn: 0, merchReceived: 0 },
      raceSubmissions: 0,
      redotPayQuizCompleted: 0,
      meteoraWallets: 0,
    };
  }

  const db = getDb();

  const [checkInRow] = await db
    .select({
      approved: sql<number>`count(*) filter (where ${participants.approvalStatus} = 'approved')::int`,
      checkedIn: sql<number>`count(*) filter (where ${participants.approvalStatus} = 'approved' and ${participants.checkedInAt} is not null)::int`,
      merchReceived: sql<number>`count(*) filter (where ${participants.approvalStatus} = 'approved' and ${participants.merchReceivedAt} is not null)::int`,
    })
    .from(participants);

  const [submissionRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(raceSubmissions);

  const [quizRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(redotpayQuizAttempts)
    .where(sql`${redotpayQuizAttempts.submittedAt} is not null`);

  const [walletRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participants)
    .where(sql`${participants.solanaWallet} is not null and trim(${participants.solanaWallet}) <> ''`);

  return {
    checkIn: {
      approved: checkInRow?.approved ?? 0,
      checkedIn: checkInRow?.checkedIn ?? 0,
      merchReceived: checkInRow?.merchReceived ?? 0,
    },
    raceSubmissions: submissionRow?.count ?? 0,
    redotPayQuizCompleted: quizRow?.count ?? 0,
    meteoraWallets: walletRow?.count ?? 0,
  };
}
