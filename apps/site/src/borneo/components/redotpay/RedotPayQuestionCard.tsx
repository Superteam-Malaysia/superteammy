"use client";

import { FormEvent, useState } from "react";
import Link from "@borneo/components/Link";
import type { RedotPayQuizQuestion } from "@borneo/data/redotpay-quiz";
import { withBasePath } from "@borneo/lib/base-path";

export type QuestionSubmissionState = {
  isCorrect: boolean;
  wonDailyPrize: boolean;
};

type RedotPayQuestionCardProps = {
  question: RedotPayQuizQuestion;
  signedIn: boolean;
  live: boolean;
  unlockLabel?: string;
  prior?: QuestionSubmissionState;
};

export function RedotPayQuestionCard({
  question,
  signedIn,
  live,
  unlockLabel,
  prior,
}: RedotPayQuestionCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    wonDailyPrize: boolean;
    dailyWinnersRemaining: number;
  } | null>(null);

  const answered = Boolean(prior || result);
  const isCorrect = prior?.isCorrect ?? result?.isCorrect ?? false;
  const wonPrize = prior?.wonDailyPrize ?? result?.wonDailyPrize ?? false;

  function toggle(optionId: string) {
    if (answered || !live || !signedIn) return;
    if (question.kind === "single") {
      setSelected([optionId]);
      return;
    }
    setSelected((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn || !live || answered) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch(withBasePath("/api/redotpay/quiz"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        answer: question.kind === "single" ? selected[0] : selected,
      }),
    });

    const data = (await res.json()) as {
      error?: string;
      isCorrect?: boolean;
      wonDailyPrize?: boolean;
      dailyWinnersRemaining?: number;
    };

    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit.");
      return;
    }

    setResult({
      isCorrect: Boolean(data.isCorrect),
      wonDailyPrize: Boolean(data.wonDailyPrize),
      dailyWinnersRemaining: data.dailyWinnersRemaining ?? 0,
    });
  }

  const locked = !live;
  const disabled = locked || !signedIn || answered;

  return (
    <article
      className={[
        "redotpay-q",
        locked ? "redotpay-q--locked" : "",
        answered ? (isCorrect ? "redotpay-q--correct" : "redotpay-q--wrong") : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="redotpay-q__head">
        <span className="redotpay-q__num">Q{question.number}</span>
        {locked && unlockLabel ? (
          <span className="redotpay-q__lock">{unlockLabel}</span>
        ) : null}
        {answered ? (
          <span className={`redotpay-q__badge redotpay-q__badge--${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
        ) : null}
        {wonPrize ? <span className="redotpay-q__prize">Luggage tag won</span> : null}
      </header>

      <p className="redotpay-q__prompt">{question.prompt}</p>

      <form onSubmit={onSubmit} className="redotpay-q__form">
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
                  onChange={() => toggle(option.id)}
                  disabled={disabled}
                  className="redotpay-q__input"
                />
                <span className="redotpay-q__option-id">{option.id}</span>
                <span className="redotpay-q__option-label">{option.label}</span>
              </label>
            );
          })}
        </fieldset>

        {!signedIn && live ? (
          <p className="redotpay-q__sign-in">
            <Link href="/login" className="redotpay-q__sign-in-link">
              Sign in to submit
            </Link>
          </p>
        ) : null}

        {error ? <p className="redotpay-q__error">{error}</p> : null}

        {result && !result.isCorrect ? (
          <p className="redotpay-q__feedback">Not quite — no prize this time.</p>
        ) : null}

        {result?.isCorrect && !result.wonDailyPrize ? (
          <p className="redotpay-q__feedback">
            Correct — today&apos;s luggage tag slots were already claimed. Try again tomorrow.
          </p>
        ) : null}

        {result?.wonDailyPrize ? (
          <p className="redotpay-q__feedback redotpay-q__feedback--win">
            Correct — you won a RedotPay luggage tag! Collect from the RedotPay desk.
          </p>
        ) : null}

        {live && signedIn && !answered ? (
          <button
            type="submit"
            disabled={submitting || selected.length === 0}
            className="cta cta--byte cta--md redotpay-q__submit disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit answer"}
          </button>
        ) : null}
      </form>
    </article>
  );
}
