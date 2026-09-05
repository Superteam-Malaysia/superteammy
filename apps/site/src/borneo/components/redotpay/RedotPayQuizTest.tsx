"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "@borneo/components/Link";
import {
  REDOTPAY_QUIZ,
  REDOTPAY_QUIZ_QUESTIONS,
  type RedotPayQuizQuestion,
} from "@borneo/data/redotpay-quiz";
import type { QuizAttemptState } from "@borneo/lib/redotpay-quiz/attempt";
import { withBasePath } from "@borneo/lib/base-path";

type AnswersMap = Record<string, string[]>;

function answersStorageKey(attemptId: string): string {
  return `redotpay-quiz-answers:${attemptId}`;
}

function readStoredAnswers(attemptId: string): AnswersMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(answersStorageKey(attemptId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as AnswersMap;
  } catch {
    return {};
  }
}

function writeStoredAnswers(attemptId: string, answers: AnswersMap): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(answersStorageKey(attemptId), JSON.stringify(answers));
  } catch {
    // ignore quota / private mode
  }
}

function clearStoredAnswers(attemptId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(answersStorageKey(attemptId));
  } catch {
    // ignore
  }
}

function applyAttemptState(
  next: QuizAttemptState | null,
): {
  attempt: QuizAttemptState | null;
  remainingMs: number;
  result: { score: number; totalQuestions: number } | null;
  answers: AnswersMap;
} {
  if (!next) {
    return { attempt: null, remainingMs: 0, result: null, answers: {} };
  }

  const remainingMs = next.completed
    ? 0
    : Math.max(0, new Date(next.expiresAt).getTime() - Date.now());

  const result =
    next.completed && next.score != null
      ? { score: next.score, totalQuestions: next.totalQuestions }
      : null;

  const inProgress = !next.completed && !next.expired;
  const answers =
    inProgress && next.attemptId ? readStoredAnswers(next.attemptId) : {};

  return { attempt: next, remainingMs, result, answers };
}

type RedotPayQuizTestProps = {
  signedIn: boolean;
  quizStarted: boolean;
  initialAttempt: QuizAttemptState | null;
};

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function QuestionBlock({
  question,
  selected,
  onToggle,
  disabled,
}: {
  question: RedotPayQuizQuestion;
  selected: string[];
  onToggle: (optionId: string) => void;
  disabled: boolean;
}) {
  return (
    <article className="redotpay-q">
      <header className="redotpay-q__head">
        <span className="redotpay-q__num">Q{question.number}</span>
      </header>
      <p className="redotpay-q__prompt">{question.prompt}</p>
      <fieldset className="redotpay-q__options" disabled={disabled}>
        <legend className="sr-only">Answer options</legend>
        {question.options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={[
                "redotpay-q__option",
                active ? "redotpay-q__option--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type={question.kind === "single" ? "radio" : "checkbox"}
                name={question.id}
                value={option.id}
                checked={active}
                onChange={() => onToggle(option.id)}
                disabled={disabled}
                className="redotpay-q__input"
              />
              <span className="redotpay-q__option-id">{option.id}</span>
              <span className="redotpay-q__option-label">{option.label}</span>
            </label>
          );
        })}
      </fieldset>
    </article>
  );
}

export function RedotPayQuizTest({
  signedIn,
  quizStarted,
  initialAttempt,
}: RedotPayQuizTestProps) {
  const initial = applyAttemptState(initialAttempt);
  const [attempt, setAttempt] = useState<QuizAttemptState | null>(initial.attempt);
  const [answers, setAnswers] = useState<AnswersMap>(initial.answers);
  const answersRef = useRef<AnswersMap>(initial.answers);
  const [remainingMs, setRemainingMs] = useState(initial.remainingMs);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; totalQuestions: number } | null>(
    initial.result,
  );
  const [resumed, setResumed] = useState(
    Boolean(initial.attempt && !initial.attempt.completed && !initial.attempt.expired),
  );

  const inProgress = Boolean(attempt && !attempt.completed && !attempt.expired);
  const completed = Boolean(result || attempt?.completed);
  const canStart = signedIn && quizStarted && !completed && !inProgress;

  useEffect(() => {
    answersRef.current = answers;
    if (attempt?.attemptId && inProgress) {
      writeStoredAnswers(attempt.attemptId, answers);
    }
  }, [answers, attempt?.attemptId, inProgress]);

  const syncAttemptFromServer = useCallback(async () => {
    if (!signedIn) return;
    const res = await fetch(withBasePath("/api/redotpay/quiz/attempt"), { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { attempt?: QuizAttemptState | null };
    const next = applyAttemptState(data.attempt ?? null);
    setAttempt(next.attempt);
    setRemainingMs(next.remainingMs);
    if (next.result) {
      setResult(next.result);
      if (next.attempt?.attemptId) clearStoredAnswers(next.attempt.attemptId);
    } else if (next.attempt && !next.attempt.completed && !next.attempt.expired) {
      setResumed(true);
      setAnswers((prev) => {
        const stored = readStoredAnswers(next.attempt!.attemptId);
        return Object.keys(stored).length ? stored : prev;
      });
    }
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn || !quizStarted) return undefined;
    void syncAttemptFromServer();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void syncAttemptFromServer();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [signedIn, quizStarted, syncAttemptFromServer]);

  const submitTest = useCallback(async (payload: AnswersMap) => {
    if (!attempt || attempt.completed || submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(withBasePath("/api/redotpay/quiz/submit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: attempt.attemptId, answers: payload }),
    });

    const data = (await res.json()) as {
      error?: string;
      score?: number;
      totalQuestions?: number;
    };

    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit.");
      if (data.error?.includes("Time expired")) {
        setResult({ score: 0, totalQuestions: attempt.totalQuestions });
        clearStoredAnswers(attempt.attemptId);
        setAttempt((prev) =>
          prev ? { ...prev, completed: true, expired: true, score: 0, remainingMs: 0 } : prev,
        );
      }
      return;
    }

    setResult({
      score: data.score ?? 0,
      totalQuestions: data.totalQuestions ?? REDOTPAY_QUIZ.totalQuestions,
    });
    if (attempt?.attemptId) clearStoredAnswers(attempt.attemptId);
    setAttempt((prev) =>
      prev
        ? {
            ...prev,
            completed: true,
            score: data.score ?? 0,
            remainingMs: 0,
          }
        : prev,
    );
  }, [attempt, submitting]);

  useEffect(() => {
    if (!inProgress || !attempt) return undefined;

    setRemainingMs(Math.max(0, new Date(attempt.expiresAt).getTime() - Date.now()));
    let expiredHandled = false;

    const timer = window.setInterval(() => {
      const ms = Math.max(0, new Date(attempt.expiresAt).getTime() - Date.now());
      setRemainingMs(ms);
      if (ms <= 0 && !expiredHandled) {
        expiredHandled = true;
        window.clearInterval(timer);
        void submitTest(answersRef.current);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [attempt, inProgress, submitTest]);

  async function onStart() {
    if (!canStart) return;
    setStarting(true);
    setError(null);

    const res = await fetch(withBasePath("/api/redotpay/quiz/start"), { method: "POST" });
    const data = (await res.json()) as QuizAttemptState & { error?: string };

    setStarting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start quiz.");
      return;
    }

    setAttempt(data);
    setRemainingMs(Math.max(0, new Date(data.expiresAt).getTime() - Date.now()));
    setAnswers({});
    clearStoredAnswers(data.attemptId);
    setResumed(false);
    setResult(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!inProgress) return;
    await submitTest(answers);
  }

  function toggleAnswer(question: RedotPayQuizQuestion, optionId: string) {
    if (!inProgress) return;
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (question.kind === "single") {
        return { ...prev, [question.id]: [optionId] };
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [question.id]: next };
    });
  }

  const answeredCount = useMemo(
    () => REDOTPAY_QUIZ_QUESTIONS.filter((q) => (answers[q.id]?.length ?? 0) > 0).length,
    [answers],
  );

  return (
    <div className="redotpay-quiz">
      <div className="redotpay-quiz__today">
        {!quizStarted ? (
          <p className="redotpay-quiz__today-label">
            Quiz opens {REDOTPAY_QUIZ.startDate} (MYT).
          </p>
        ) : completed && result ? (
          <>
            <p className="redotpay-quiz__today-label">
              Your score · {result.score}/{result.totalQuestions}
            </p>
            <p className="redotpay-quiz__today-hint">
              One attempt per profile — your points are logged. Thanks for playing!
            </p>
          </>
        ) : inProgress ? (
          <>
            <p className="redotpay-quiz__today-label">
              Time left · {formatCountdown(remainingMs)}
            </p>
            <p className="redotpay-quiz__today-hint">
              {resumed
                ? "Quiz resumed — your 2-minute timer is still running from when you started. "
                : "Answer all 10 questions, then submit before the timer hits zero. "}
              {answeredCount}/10 answered.
            </p>
          </>
        ) : (
          <>
            <p className="redotpay-quiz__today-label">All 10 questions · 2 minute limit</p>
            <p className="redotpay-quiz__today-hint">
              Sign in to start. You get one attempt — the clock starts when you tap Begin quiz.
            </p>
          </>
        )}
      </div>

      {!signedIn && quizStarted ? (
        <p className="redotpay-q__sign-in">
          <Link href="/login" className="redotpay-q__sign-in-link">
            Sign in to take the quiz
          </Link>
        </p>
      ) : null}

      {canStart ? (
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className="cta cta--byte cta--md redotpay-quiz__begin"
        >
          {starting ? "Starting…" : "Begin quiz"}
        </button>
      ) : null}

      {error ? <p className="redotpay-q__error">{error}</p> : null}

      {(inProgress || completed) && (
        <form onSubmit={onSubmit} className="redotpay-quiz__list list-none">
          {REDOTPAY_QUIZ_QUESTIONS.map((question) => (
            <QuestionBlock
              key={question.id}
              question={question}
              selected={answers[question.id] ?? []}
              onToggle={(optionId) => toggleAnswer(question, optionId)}
              disabled={!inProgress || submitting}
            />
          ))}

          {inProgress ? (
            <button
              type="submit"
              disabled={submitting}
              className="cta cta--byte cta--md redotpay-q__submit disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit quiz"}
            </button>
          ) : null}
        </form>
      )}
    </div>
  );
}
