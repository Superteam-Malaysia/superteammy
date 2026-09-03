import { and, count, eq } from "drizzle-orm";
import { REDOTPAY_QUIZ } from "@borneo/data/redotpay-quiz";
import { getDb } from "@borneo/lib/db";
import { redotpayQuizSubmissions } from "@borneo/lib/db/schema";
import {
  isAnswerCorrect,
  quizCalendarDate,
  validateSubmission,
} from "@borneo/lib/redotpay-quiz/schedule";

export type SubmitQuizResult =
  | {
      ok: true;
      isCorrect: boolean;
      wonDailyPrize: boolean;
      dailyWinnersRemaining: number;
    }
  | { ok: false; error: string };

export async function submitRedotPayQuizAnswer(
  participantId: string,
  questionId: string,
  answer: unknown,
): Promise<SubmitQuizResult> {
  const validated = validateSubmission(questionId, answer);
  if (!validated.ok) return validated;

  const { question, answer: normalized } = validated;
  const correct = isAnswerCorrect(question, normalized);
  const quizDay = quizCalendarDate();

  const db = getDb();

  const existing = await db
    .select({ id: redotpayQuizSubmissions.id })
    .from(redotpayQuizSubmissions)
    .where(
      and(
        eq(redotpayQuizSubmissions.participantId, participantId),
        eq(redotpayQuizSubmissions.questionId, questionId),
      ),
    )
    .limit(1);

  if (existing.length) {
    return { ok: false, error: "You already answered this question." };
  }

  let wonDailyPrize = false;

  if (correct) {
    const [priorWin] = await db
      .select({ id: redotpayQuizSubmissions.id })
      .from(redotpayQuizSubmissions)
      .where(
        and(
          eq(redotpayQuizSubmissions.participantId, participantId),
          eq(redotpayQuizSubmissions.quizDay, quizDay),
          eq(redotpayQuizSubmissions.wonDailyPrize, true),
        ),
      )
      .limit(1);

    if (!priorWin) {
      const [winnerRow] = await db
        .select({ count: count() })
        .from(redotpayQuizSubmissions)
        .where(
          and(
            eq(redotpayQuizSubmissions.quizDay, quizDay),
            eq(redotpayQuizSubmissions.wonDailyPrize, true),
          ),
        );

      const winnerCount = Number(winnerRow?.count ?? 0);
      if (winnerCount < REDOTPAY_QUIZ.dailyWinnerCount) {
        wonDailyPrize = true;
      }
    }
  }

  await db.insert(redotpayQuizSubmissions).values({
    participantId,
    questionId,
    answer: normalized,
    isCorrect: correct,
    quizDay,
    wonDailyPrize,
  });

  const [winnerRowAfter] = await db
    .select({ count: count() })
    .from(redotpayQuizSubmissions)
    .where(
      and(
        eq(redotpayQuizSubmissions.quizDay, quizDay),
        eq(redotpayQuizSubmissions.wonDailyPrize, true),
      ),
    );

  const winnersUsed = Number(winnerRowAfter?.count ?? 0);

  return {
    ok: true,
    isCorrect: correct,
    wonDailyPrize,
    dailyWinnersRemaining: Math.max(0, REDOTPAY_QUIZ.dailyWinnerCount - winnersUsed),
  };
}

export async function getParticipantQuizState(participantId: string) {
  const db = getDb();
  const rows = await db
    .select({
      questionId: redotpayQuizSubmissions.questionId,
      isCorrect: redotpayQuizSubmissions.isCorrect,
      wonDailyPrize: redotpayQuizSubmissions.wonDailyPrize,
    })
    .from(redotpayQuizSubmissions)
    .where(eq(redotpayQuizSubmissions.participantId, participantId));

  return Object.fromEntries(
    rows.map((row) => [
      row.questionId,
      { isCorrect: row.isCorrect, wonDailyPrize: row.wonDailyPrize },
    ]),
  );
}

export async function getDailyWinnerCount(quizDay: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: count() })
    .from(redotpayQuizSubmissions)
    .where(
      and(
        eq(redotpayQuizSubmissions.quizDay, quizDay),
        eq(redotpayQuizSubmissions.wonDailyPrize, true),
      ),
    );
  return Number(row?.count ?? 0);
}
