import { NextResponse } from "next/server";
import { listPublicRaceFeed } from "@borneo/lib/race/submissions";

export async function GET() {
  const feed = await listPublicRaceFeed();
  return NextResponse.json({ feed });
}
