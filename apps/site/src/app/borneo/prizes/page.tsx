import { ActionCard, CtaButton, SectionArticle, SectionIntro } from "@borneo/components/ui";
import { JudgesPanel } from "@borneo/components/prizes";
import { PageHeader } from "@borneo/components/shell";
import { METEORA_CHALLENGE } from "@borneo/data/meteora-challenge";
import { PRIZE_ROWS, PRIZE_TOTAL } from "@borneo/data/prizes";
import { REDOTPAY_QUIZ } from "@borneo/data/redotpay-quiz";
import { CONTENT_AWARD, SUSTAINABILITY_TRACK } from "@borneo/data/tracks";
import { pageMetadata } from "@borneo/lib/metadata";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "Prizes",
  description: "USD $10,000 prize pool for Startup Village Borneo — hackathon, race, content, and sustainability tracks.",
  path: "/prizes",
});

export default function PrizesPage() {
  return (
    <main className="site-main prizes-page">
      <PageHeader
        title={`${PRIZE_TOTAL} prize pool`}
        lead="USD $10,000 across demo day, Amazing Race, content, and sustainability tracks. Meteora and RedotPay run separate partner challenges."
      />
      <SectionArticle>
        <SectionIntro title="Prize breakdown" accent="byte" />
        <table className="mt-6 w-full max-w-2xl text-left border-collapse">
          <thead className="sr-only">
            <tr>
              <th scope="col">Award</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {PRIZE_ROWS.map((row) => (
              <tr key={row.label} className="border-t border-[color:var(--color-transparent-wisp-10)] first:border-t-0">
                <td className="py-4 font-[family-name:var(--font-mono)] text-sm">
                  {row.label}
                  {row.note ? (
                    <span className="mt-1 block text-xs text-[color:var(--color-transparent-wisp-55)] normal-case tracking-normal">
                      {row.note}
                    </span>
                  ) : null}
                </td>
                <td className="py-4 text-right font-[family-name:var(--font-display)] text-xl">
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-16">
          <h3 className="text-label">Program tracks</h3>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 list-none">
            <li>
              <ActionCard
                tone="azure"
                title="Sustainability"
                description={`${SUSTAINABILITY_TRACK.prizes.count}×${SUSTAINABILITY_TRACK.prizes.amount}`}
                cta={{ label: "Track criteria", href: "/sustainability" }}
              />
            </li>
            <li>
              <ActionCard
                tone="mint"
                title="Content Award"
                description={`${CONTENT_AWARD.prizes.count}×${CONTENT_AWARD.prizes.amount}`}
                cta={{ label: "Content tasks", href: "/content-awards" }}
              />
            </li>
            <li>
              <ActionCard
                tone="null"
                title="Amazing Race"
                description="2×$500"
                cta={{ label: "Race tasks", href: "/amazing-race" }}
              />
            </li>
            <li>
              <ActionCard
                tone="azure"
                title="Meteora challenge"
                description={`${METEORA_CHALLENGE.prize} · $25 match, best PnL`}
                cta={{ label: "Challenge details", href: "/meteora" }}
              />
            </li>
            <li>
              <ActionCard
                tone="mint"
                title="RedotPay Card Quiz"
                logo={{ src: withBasePath("/partners/redotpay.svg"), alt: "RedotPay" }}
                description={`${REDOTPAY_QUIZ.prize} · 10 questions · 2 min · 1 attempt`}
                cta={{ label: "Take the quiz", href: "/redotpay" }}
              />
            </li>
          </ul>
        </div>
        <JudgesPanel />
      </SectionArticle>
      <SectionArticle>
        <div className="mt-0">
          <CtaButton href="/submissions" variant="byte" size="md">Submission rules</CtaButton>
        </div>
      </SectionArticle>
    </main>
  );
}
