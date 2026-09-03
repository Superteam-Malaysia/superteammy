import {
  REDOTPAY_QUIZ,
  REDOTPAY_QUIZ_QUESTIONS,
  REDOTPAY_QUESTION_BY_ID,
  type RedotPayQuizQuestion,
} from "@borneo/data/redotpay-quiz";

const DAY_MS = 24 * 60 * 60 * 1000;

function quizNow(): Date {
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

/** 0-based day index since quiz start, or -1 before start. */
export function quizDayIndex(date: Date = quizNow()): number {
  const dayStart = Date.parse(`${quizCalendarDate(date)}T00:00:00+08:00`);
  const start = startTimestamp();
  if (dayStart < start) return -1;
  return Math.floor((dayStart - start) / DAY_MS);
}

export function quizDayLabel(dayIndex: number): string {
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
  return labels[dayIndex] ?? `Day ${dayIndex + 1}`;
}

export function questionReleaseDayIndex(question: RedotPayQuizQuestion): number {
  return Math.floor((question.number - 1) / REDOTPAY_QUIZ.questionsPerDay);
}

export function isQuestionLive(questionId: string, date: Date = quizNow()): boolean {
  const question = REDOTPAY_QUESTION_BY_ID[questionId];
  if (!question) return false;
  const day = quizDayIndex(date);
  return day >= questionReleaseDayIndex(question);
}

export function liveQuestions(date: Date = quizNow()): RedotPayQuizQuestion[] {
  return REDOTPAY_QUIZ_QUESTIONS.filter((q) => isQuestionLive(q.id, date));
}

export function lockedQuestions(date: Date = quizNow()): RedotPayQuizQuestion[] {
  return REDOTPAY_QUIZ_QUESTIONS.filter((q) => !isQuestionLive(q.id, date));
}

export function quizHasStarted(date: Date = quizNow()): boolean {
  return quizDayIndex(date) >= 0;
}

export function quizIsComplete(date: Date = quizNow()): boolean {
  const day = quizDayIndex(date);
  const lastDay = questionReleaseDayIndex(REDOTPAY_QUIZ_QUESTIONS.at(-1)!);
  return day > lastDay;
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

export function validateSubmission(
  questionId: string,
  answer: unknown,
  date: Date = quizNow(),
): { ok: true; answer: string[]; question: RedotPayQuizQuestion } | { ok: false; error: string } {
  const question = REDOTPAY_QUESTION_BY_ID[questionId];
  if (!question) return { ok: false, error: "Unknown question." };

  if (!quizHasStarted(date)) {
    return { ok: false, error: "Quiz has not started yet." };
  }

  if (!isQuestionLive(questionId, date)) {
    return { ok: false, error: "This question is not live yet." };
  }

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
