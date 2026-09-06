import { NextResponse } from "next/server";
import { getRaceLeaderboard } from "@borneo/lib/race/leaderboard";

export async function GET() {
  const leaderboard = await getRaceLeaderboard();
  return NextResponse.json({ leaderboard });
}
