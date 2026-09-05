import { desc, eq, isNotNull, sql } from "drizzle-orm";
import {
  REDOTPAY_QUIZ,
  REDOTPAY_QUIZ_QUESTIONS,
  REDOTPAY_QUESTION_BY_ID,
  type RedotPayQuizQuestion,
} from "@borneo/data/redotpay-quiz";
import { getDb } from "@borneo/lib/db";
import { participants, redotpayQuizAttempts } from "@borneo/lib/db/schema";
import {
  isAnswerCorrect,
  isQuizAttemptExpired,
  normalizeAnswer,
  quizAttemptExpiresAt,
  quizHasStarted,
  quizNow,
  validateQuestionAnswer,
} from "@borneo/lib/redotpay-quiz/schedule";

export type QuizAttemptState = {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number;
  remainingMs: number;
  expired: boolean;
  completed: boolean;
};

export type QuizLeaderboardRow = {
  rank: number;
  participantId: string;
  name: string;
  score: number;
  totalQuestions: number;
  durationMs: number | null;
  submittedAt: string;
};

type AttemptRow = typeof redotpayQuizAttempts.$inferSelect;

function toAttemptState(row: AttemptRow, now = quizNow()): QuizAttemptState {
  const expired = !row.submittedAt && isQuizAttemptExpired(row.startedAt, now);
  const expiresAt = quizAttemptExpiresAt(row.startedAt);
  return {
    attemptId: row.id,
    startedAt: row.startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString() ?? null,
    score: row.submittedAt ? row.score : null,
    totalQuestions: row.totalQuestions,
    remainingMs: row.submittedAt ? 0 : Math.max(0, expiresAt.getTime() - now.getTime()),
    expired,
    completed: Boolean(row.submittedAt),
  };
}

async function getAttemptRow(participantId: string): Promise<AttemptRow | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(redotpayQuizAttempts)
    .where(eq(redotpayQuizAttempts.participantId, participantId))
    .limit(1);
  return row ?? null;
}

async function closeAttempt(
  row: AttemptRow,
  answers: Record<string, string[]>,
  score: number,
  submittedAt: Date,
) {
  const db = getDb();
  const durationMs = Math.max(0, submittedAt.getTime() - row.startedAt.getTime());
  await db
    .update(redotpayQuizAttempts)
    .set({
      submittedAt,
      score,
      answers,
      durationMs,
    })
    .where(eq(redotpayQuizAttempts.id, row.id));
}

function gradeAnswers(rawAnswers: Record<string, unknown>): {
  normalized: Record<string, string[]>;
  score: number;
} {
  const normalized: Record<string, string[]> = {};
  let score = 0;

  for (const question of REDOTPAY_QUIZ_QUESTIONS) {
    const validated = validateQuestionAnswer(question.id, rawAnswers[question.id]);
    const answer = validated.ok ? validated.answer : [];
    normalized[question.id] = answer;
    if (validated.ok && isAnswerCorrect(question, answer)) {
      score += 1;
    }
  }

  return { normalized, score };
}

/** Finalize an expired in-progress attempt with score 0. */
export async function finalizeExpiredQuizAttempt(participantId: string): Promise<void> {
  const row = await getAttemptRow(participantId);
  if (!row || row.submittedAt || !isQuizAttemptExpired(row.startedAt)) return;
  await closeAttempt(row, {}, 0, quizAttemptExpiresAt(row.startedAt));
}

export async function getParticipantQuizAttempt(
  participantId: string,
): Promise<QuizAttemptState | null> {
  await finalizeExpiredQuizAttempt(participantId);
  const row = await getAttemptRow(participantId);
  return row ? toAttemptState(row) : null;
}

export type StartQuizResult =
  | { ok: true; attempt: QuizAttemptState }
  | { ok: false; error: string };

export async function startRedotPayQuizAttempt(participantId: string): Promise<StartQuizResult> {
  if (!quizHasStarted()) {
    return { ok: false, error: "Quiz has not started yet." };
  }

  await finalizeExpiredQuizAttempt(participantId);
  const existing = await getAttemptRow(participantId);

  if (existing?.submittedAt) {
    return { ok: false, error: "You already completed the quiz." };
  }

  if (existing && !existing.submittedAt) {
    if (isQuizAttemptExpired(existing.startedAt)) {
      await closeAttempt(existing, {}, 0, quizAttemptExpiresAt(existing.startedAt));
      return { ok: false, error: "Time expired — your attempt is closed." };
    }
    return { ok: true, attempt: toAttemptState(existing) };
  }

  const db = getDb();
  const now = quizNow();
  const [row] = await db
    .insert(redotpayQuizAttempts)
    .values({
      participantId,
      startedAt: now,
      totalQuestions: REDOTPAY_QUIZ.totalQuestions,
    })
    .returning();

  return { ok: true, attempt: toAttemptState(row) };
}

export type SubmitQuizResult =
  | {
      ok: true;
      score: number;
      totalQuestions: number;
      durationMs: number;
    }
  | { ok: false; error: string };

export async function submitRedotPayQuizAttempt(
  participantId: string,
  attemptId: string,
  answers: unknown,
): Promise<SubmitQuizResult> {
  if (!quizHasStarted()) {
    return { ok: false, error: "Quiz has not started yet." };
  }

  if (!attemptId?.trim()) {
    return { ok: false, error: "Missing attempt id." };
  }

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return { ok: false, error: "Invalid answers payload." };
  }

  const row = await getAttemptRow(participantId);
  if (!row || row.id !== attemptId) {
    return { ok: false, error: "Invalid quiz attempt." };
  }

  if (row.submittedAt) {
    return { ok: false, error: "You already submitted this quiz." };
  }

  const now = quizNow();
  if (isQuizAttemptExpired(row.startedAt, now)) {
    await closeAttempt(row, {}, 0, quizAttemptExpiresAt(row.startedAt));
    return { ok: false, error: "Time expired — answers not accepted." };
  }

  const { normalized, score } = gradeAnswers(answers as Record<string, unknown>);
  await closeAttempt(row, normalized, score, now);

  return {
    ok: true,
    score,
    totalQuestions: row.totalQuestions,
    durationMs: Math.max(0, now.getTime() - row.startedAt.getTime()),
  };
}

export async function getRedotPayQuizLeaderboard(limit = 50): Promise<QuizLeaderboardRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      participantId: redotpayQuizAttempts.participantId,
      name: participants.name,
      email: participants.email,
      score: redotpayQuizAttempts.score,
      totalQuestions: redotpayQuizAttempts.totalQuestions,
      durationMs: redotpayQuizAttempts.durationMs,
      submittedAt: redotpayQuizAttempts.submittedAt,
    })
    .from(redotpayQuizAttempts)
    .innerJoin(participants, eq(redotpayQuizAttempts.participantId, participants.id))
    .where(isNotNull(redotpayQuizAttempts.submittedAt))
    .orderBy(
      desc(redotpayQuizAttempts.score),
      sql`${redotpayQuizAttempts.durationMs} ASC NULLS LAST`,
      redotpayQuizAttempts.submittedAt,
    )
    .limit(limit);

  return rows.map((row, index) => ({
    rank: index + 1,
    participantId: row.participantId,
    name: row.name?.trim() || row.email,
    score: row.score,
    totalQuestions: row.totalQuestions,
    durationMs: row.durationMs,
    submittedAt: row.submittedAt!.toISOString(),
  }));
}

export { isAnswerCorrect, normalizeAnswer, type RedotPayQuizQuestion, REDOTPAY_QUESTION_BY_ID };
