import { NextResponse } from "next/server";
import { rowsToCsv } from "@borneo/lib/csv/escape";
import { requireOrganizerApi } from "@borneo/lib/auth/organizer";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { listMeteoraWalletsForExport } from "@borneo/lib/meteora/admin-wallets-export";

export const maxDuration = 300;

export async function GET() {
  const participant = await getParticipantForSession();
  const auth = requireOrganizerApi(participant);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rows = await listMeteoraWalletsForExport();
  const csv = rowsToCsv([
    ["email", "telegram", "wallet", "balance_usd"],
    ...rows.map((row) => [row.email, row.telegram, row.solanaWallet, row.balance]),
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="meteora-wallets-${stamp}.csv"`,
    },
  });
}
