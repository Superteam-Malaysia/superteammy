import { RedotPayQuizTest } from "@borneo/components/redotpay/RedotPayQuizTest";
import { REDOTPAY_QUIZ } from "@borneo/data/redotpay-quiz";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { pageMetadata } from "@borneo/lib/metadata";
import { getParticipantQuizAttempt } from "@borneo/lib/redotpay-quiz/attempt";
import { quizHasStarted } from "@borneo/lib/redotpay-quiz/schedule";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "RedotPay Card Quiz",
  description:
    "RedotPay card quiz at Startup Village Borneo — 10 questions, 2 minutes, one attempt per profile.",
  path: "/redotpay",
});

export const dynamic = "force-dynamic";

export default async function RedotPayPage() {
  const participant = await getParticipantForSession();
  const signedIn = Boolean(participant);
  const quizStarted = quizHasStarted();
  const attempt = participant ? await getParticipantQuizAttempt(participant.id) : null;

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
              <span className="redotpay-hero__stat-value">2 min</span>
              <span className="redotpay-hero__stat-label">Time limit</span>
            </div>
            <div className="redotpay-hero__stat">
              <span className="redotpay-hero__stat-value">1×</span>
              <span className="redotpay-hero__stat-label">Per profile</span>
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
        <RedotPayQuizTest
          signedIn={signedIn}
          quizStarted={quizStarted}
          initialAttempt={attempt}
        />
      </section>
    </main>
  );
}
