import { desc, eq, sql } from "drizzle-orm";
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
  isQuizAttemptPastSubmitGrace,
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

/** Closed at 0/10 with no answers — timer bug discarded the payload. */
export function isUnsavedAutoSubmitAttempt(row: Pick<AttemptRow, "submittedAt" | "score" | "answers">): boolean {
  if (!row.submittedAt || row.score !== 0) return false;
  const answers = row.answers;
  if (answers == null) return true;
  if (typeof answers !== "object" || Array.isArray(answers)) return false;
  return Object.keys(answers).length === 0;
}

async function clearUnsavedAutoSubmitAttempt(participantId: string): Promise<boolean> {
  const row = await getAttemptRow(participantId);
  if (!row || !isUnsavedAutoSubmitAttempt(row)) return false;
  const db = getDb();
  await db.delete(redotpayQuizAttempts).where(eq(redotpayQuizAttempts.id, row.id));
  return true;
}

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

/** Finalize an abandoned attempt with score 0 after the auto-submit grace window. */
export async function finalizeExpiredQuizAttempt(participantId: string): Promise<void> {
  const row = await getAttemptRow(participantId);
  if (!row || row.submittedAt || !isQuizAttemptPastSubmitGrace(row.startedAt)) return;
  await closeAttempt(row, {}, 0, quizAttemptExpiresAt(row.startedAt));
}

export type ParticipantQuizAttemptResult = {
  attempt: QuizAttemptState | null;
  /** True when a bugged 0-score attempt was cleared so the user can retake. */
  retakeAfterBug: boolean;
};

export async function getParticipantQuizAttempt(
  participantId: string,
): Promise<ParticipantQuizAttemptResult> {
  await finalizeExpiredQuizAttempt(participantId);
  const retakeAfterBug = await clearUnsavedAutoSubmitAttempt(participantId);
  const row = await getAttemptRow(participantId);
  return {
    attempt: row ? toAttemptState(row) : null,
    retakeAfterBug,
  };
}

export type StartQuizResult =
  | { ok: true; attempt: QuizAttemptState }
  | { ok: false; error: string };

export async function startRedotPayQuizAttempt(participantId: string): Promise<StartQuizResult> {
  if (!quizHasStarted()) {
    return { ok: false, error: "Quiz has not started yet." };
  }

  await finalizeExpiredQuizAttempt(participantId);
  await clearUnsavedAutoSubmitAttempt(participantId);
  const existing = await getAttemptRow(participantId);

  if (existing?.submittedAt) {
    return { ok: false, error: "You already completed the quiz." };
  }

  if (existing && !existing.submittedAt) {
    if (isQuizAttemptPastSubmitGrace(existing.startedAt)) {
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

  let row = await getAttemptRow(participantId);
  if (!row || row.id !== attemptId) {
    return { ok: false, error: "Invalid quiz attempt." };
  }

  if (row.submittedAt && isUnsavedAutoSubmitAttempt(row)) {
    await clearUnsavedAutoSubmitAttempt(participantId);
    return { ok: false, error: "Your previous attempt did not save — please start the quiz again." };
  }

  if (row.submittedAt) {
    return { ok: false, error: "You already submitted this quiz." };
  }

  const now = quizNow();
  const expiresAt = quizAttemptExpiresAt(row.startedAt);

  if (isQuizAttemptPastSubmitGrace(row.startedAt, now)) {
    await closeAttempt(row, {}, 0, expiresAt);
    return { ok: false, error: "Time expired — answers not accepted." };
  }

  const { normalized, score } = gradeAnswers(answers as Record<string, unknown>);
  const timedOut = isQuizAttemptExpired(row.startedAt, now);
  const submittedAt = timedOut ? expiresAt : now;
  await closeAttempt(row, normalized, score, submittedAt);

  return {
    ok: true,
    score,
    totalQuestions: row.totalQuestions,
    durationMs: Math.max(0, submittedAt.getTime() - row.startedAt.getTime()),
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
    .where(
      sql`${redotpayQuizAttempts.submittedAt} IS NOT NULL
        AND NOT (
          ${redotpayQuizAttempts.score} = 0
          AND (
            ${redotpayQuizAttempts.answers} IS NULL
            OR ${redotpayQuizAttempts.answers} = '{}'::jsonb
          )
        )`,
    )
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
