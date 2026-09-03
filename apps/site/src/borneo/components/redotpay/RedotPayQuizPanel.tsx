"use client";

import { REDOTPAY_QUIZ, REDOTPAY_QUIZ_QUESTIONS } from "@borneo/data/redotpay-quiz";
import {
  questionReleaseDayIndex,
  quizDayLabel,
} from "@borneo/lib/redotpay-quiz/schedule";
import {
  RedotPayQuestionCard,
  type QuestionSubmissionState,
} from "./RedotPayQuestionCard";

type RedotPayQuizPanelProps = {
  signedIn: boolean;
  submissions: Record<string, QuestionSubmissionState>;
  dailyWinnersUsed: number;
  dayIndex: number;
  quizStarted: boolean;
};

export function RedotPayQuizPanel({
  signedIn,
  submissions,
  dailyWinnersUsed,
  dayIndex,
  quizStarted,
}: RedotPayQuizPanelProps) {
  const started = quizStarted;
  const remaining = Math.max(0, REDOTPAY_QUIZ.dailyWinnerCount - dailyWinnersUsed);

  return (
    <div className="redotpay-quiz">
      <div className="redotpay-quiz__today">
        {started ? (
          <>
            <p className="redotpay-quiz__today-label">
              Today · {quizDayLabel(dayIndex)} · {remaining} luggage tag
              {remaining === 1 ? "" : "s"} left
            </p>
            <p className="redotpay-quiz__today-hint">
              Two new questions each day. First {REDOTPAY_QUIZ.dailyWinnerCount} correct answers
              per day win a tag — one per person per day.
            </p>
          </>
        ) : (
          <p className="redotpay-quiz__today-label">
            Quiz opens {REDOTPAY_QUIZ.startDate} (MYT) — two questions daily through Day 5.
          </p>
        )}
      </div>

      <ul className="redotpay-quiz__list list-none">
        {REDOTPAY_QUIZ_QUESTIONS.map((question) => {
          const releaseDay = questionReleaseDayIndex(question);
          const live = started && dayIndex >= releaseDay;
          const unlockLabel = live
            ? undefined
            : `Unlocks ${quizDayLabel(releaseDay)}`;

          return (
            <li key={question.id}>
              <RedotPayQuestionCard
                question={question}
                signedIn={signedIn}
                live={live}
                unlockLabel={unlockLabel}
                prior={submissions[question.id]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
