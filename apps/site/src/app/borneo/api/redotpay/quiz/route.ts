import { NextResponse } from "next/server";

/** @deprecated Use POST /api/redotpay/quiz/start and /api/redotpay/quiz/submit */
export async function POST() {
  return NextResponse.json(
    { error: "Per-question submissions are disabled. Start the timed quiz instead." },
    { status: 410 },
  );
}
