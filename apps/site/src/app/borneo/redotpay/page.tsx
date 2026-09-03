import { RedotPayQuizPanel } from "@borneo/components/redotpay/RedotPayQuizPanel";
import { REDOTPAY_QUIZ } from "@borneo/data/redotpay-quiz";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { pageMetadata } from "@borneo/lib/metadata";
import { quizCalendarDate, quizDayIndex, quizHasStarted } from "@borneo/lib/redotpay-quiz/schedule";
import {
  getDailyWinnerCount,
  getParticipantQuizState,
} from "@borneo/lib/redotpay-quiz/submit";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "RedotPay Card Quiz",
  description:
    "Daily RedotPay card quiz at Startup Village Borneo — two questions per day, luggage tags for the fastest correct answers.",
  path: "/redotpay",
});

export const dynamic = "force-dynamic";

export default async function RedotPayPage() {
  const participant = await getParticipantForSession();
  const signedIn = Boolean(participant);
  const quizDay = quizCalendarDate();
  const dayIndex = quizDayIndex();
  const quizStarted = quizHasStarted();
  const dailyWinnersUsed = await getDailyWinnerCount(quizDay);
  const submissions = participant ? await getParticipantQuizState(participant.id) : {};

  return (
    <main className="site-main redotpay-page">
      <header className="redotpay-hero">
        <div className="redotpay-hero__inner">
          <p className="redotpay-hero__eyebrow">Partner quiz · Startup Village Borneo</p>
          <h1 className="redotpay-hero__title">{REDOTPAY_QUIZ.title}</h1>
          <p className="redotpay-hero__lead">{REDOTPAY_QUIZ.intro}</p>
          <div className="redotpay-hero__stats">
            <div className="redotpay-hero__stat">
              <span className="redotpay-hero__stat-value">10</span>
              <span className="redotpay-hero__stat-label">Questions</span>
            </div>
            <div className="redotpay-hero__stat">
              <span className="redotpay-hero__stat-value">2/day</span>
              <span className="redotpay-hero__stat-label">Release rate</span>
            </div>
            <div className="redotpay-hero__stat">
              <span className="redotpay-hero__stat-value">{REDOTPAY_QUIZ.dailyWinnerCount}</span>
              <span className="redotpay-hero__stat-label">Tags per day</span>
            </div>
          </div>
          <img
            src={withBasePath("/partners/redotpay.svg")}
            alt="RedotPay"
            className="redotpay-hero__logo"
            width={140}
            height={32}
          />
        </div>
      </header>

      <section className="redotpay-quiz-wrap">
        <RedotPayQuizPanel
          signedIn={signedIn}
          submissions={submissions}
          dailyWinnersUsed={dailyWinnersUsed}
          dayIndex={dayIndex}
          quizStarted={quizStarted}
        />
      </section>
    </main>
  );
}
