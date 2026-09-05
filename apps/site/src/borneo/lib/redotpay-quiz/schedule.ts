import {
  REDOTPAY_QUIZ,
  REDOTPAY_QUIZ_QUESTIONS,
  REDOTPAY_QUESTION_BY_ID,
  type RedotPayQuizQuestion,
} from "@borneo/data/redotpay-quiz";

export function quizNow(): Date {
  const override = process.env.REDOTPAY_QUIZ_NOW?.trim();
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/** Calendar date string YYYY-MM-DD in quiz timezone (Asia/Kuching). */
export function quizCalendarDate(date: Date = quizNow()): string {
  return date.toLocaleDateString("en-CA", { timeZone: REDOTPAY_QUIZ.timezone });
}

function startTimestamp(): number {
  return Date.parse(`${REDOTPAY_QUIZ.startDate}T00:00:00+08:00`);
}

export function quizHasStarted(date: Date = quizNow()): boolean {
  const dayStart = Date.parse(`${quizCalendarDate(date)}T00:00:00+08:00`);
  return dayStart >= startTimestamp();
}

export function quizAttemptExpiresAt(startedAt: Date): Date {
  return new Date(startedAt.getTime() + REDOTPAY_QUIZ.timeLimitSeconds * 1000);
}

export function isQuizAttemptExpired(startedAt: Date, now: Date = quizNow()): boolean {
  return now.getTime() > quizAttemptExpiresAt(startedAt).getTime();
}

export function normalizeAnswer(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) return [value.trim().toUpperCase()];
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .sort();
}

export function isAnswerCorrect(question: RedotPayQuizQuestion, answer: string[]): boolean {
  const normalized = [...answer].sort();
  const correct = [...question.correct].sort();
  if (normalized.length !== correct.length) return false;
  return normalized.every((item, index) => item === correct[index]);
}

export function validateQuestionAnswer(
  questionId: string,
  answer: unknown,
): { ok: true; answer: string[]; question: RedotPayQuizQuestion } | { ok: false; error: string } {
  const question = REDOTPAY_QUESTION_BY_ID[questionId];
  if (!question) return { ok: false, error: "Unknown question." };

  const normalized = normalizeAnswer(answer);
  if (!normalized.length) return { ok: false, error: "Pick an answer." };

  if (question.kind === "single" && normalized.length !== 1) {
    return { ok: false, error: "Pick one answer." };
  }

  const validIds = new Set(question.options.map((o) => o.id));
  if (!normalized.every((id) => validIds.has(id))) {
    return { ok: false, error: "Invalid option." };
  }

  return { ok: true, answer: normalized, question };
}

export function allQuizQuestionsReleased(date: Date = quizNow()): boolean {
  return quizHasStarted(date);
}

export { REDOTPAY_QUIZ_QUESTIONS, REDOTPAY_QUESTION_BY_ID, type RedotPayQuizQuestion };
