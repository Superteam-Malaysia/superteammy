import { MerchDrop } from "@borneo/components/merch";
import { PartnerLogoWall } from "@borneo/components/partners";
import { PrizeTracksPanel } from "@borneo/components/prizes";
import { FooterScrambleTicker } from "@borneo/components/shell/FooterScrambleTicker";
import { HeroVideoBackdrop } from "@borneo/components/shell/HeroVideoBackdrop";
import { EmbeddedTweetCard } from "@borneo/components/shell/EmbeddedTweetCard";
import { HeroWordmark } from "@borneo/components/shell/HeroWordmark";
import { LumaApplyButton } from "@borneo/components/shell/LumaApplyButton";
import { PreFooterBand } from "@borneo/components/shell/PreFooterBand";
import { ScheduleDayCards } from "@borneo/components/schedule";
import { WorkshopRowList } from "@borneo/components/speakers";
import {
  Accordion,
  CtaButton,
  SectionArticle,
  SectionIntro,
} from "@borneo/components/ui";
import { BEFORE_YOU_LAND_FAQ_IDS, faqById } from "@borneo/data/faq";
import {
  ANCHOR_PARTNERS,
  PENDING_PARTNERS,
  SUPPORTING_PARTNERS,
} from "@borneo/data/partners";
import { SCHEDULE_DAYS } from "@borneo/data/schedule";
import { WORKSHOP_SESSIONS } from "@borneo/data/speakers";
import { SITE } from "@borneo/data/site";

export default function HomePage() {
  const previewFaq = BEFORE_YOU_LAND_FAQ_IDS.map((id) => faqById(id)).filter(
    (item): item is NonNullable<typeof item> => item != null,
  );

  return (
    <main>
      {/* Hero — Breakpoint-style letter reveal */}
      <section className="home-hero">
        <div className="home-hero__stage">
          <HeroVideoBackdrop
            src={SITE.announcementVideoSrc}
            poster={SITE.announcementVideoPoster}
            tweetUrl={SITE.announcementTweetUrl}
          />
          <div className="home-hero__inner relative z-10 max-w-[90rem] mx-auto px-4 md:px-8">
            <HeroWordmark />
          </div>
          <div className="home-hero__separator relative z-10">
            <LumaApplyButton />
          </div>
        </div>
        <FooterScrambleTicker
          variant="azure"
          className="footer-scramble--divider"
        />
      </section>

      {/* Schedule preview */}
      <section id="schedule" className="border-b border-[color:var(--color-transparent-wisp-10)]">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionArticle>
            <SectionIntro title="Five days of build, race, and demos" accent="byte" />
            <ScheduleDayCards days={SCHEDULE_DAYS} />
            <div className="mt-10">
              <CtaButton href="/schedule" variant="azure" size="md">Full calendar</CtaButton>
            </div>
          </SectionArticle>
        </div>
      </section>

      {/* Speakers preview — Breakout livestream workshop rows */}
      <section className="border-b border-[color:var(--color-transparent-wisp-10)]">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionArticle>
            <SectionIntro title="Workshop leaders on stage" accent="green" />
            <WorkshopRowList sessions={WORKSHOP_SESSIONS} limit={6} />
            <div className="mt-10">
              <CtaButton href="/speakers" variant="ghost-wisp" size="md">All sessions</CtaButton>
            </div>
          </SectionArticle>
        </div>
      </section>

      {/* Merch drop — Superteam MY kit sneak peek */}
      <section id="merch" className="border-b border-[color:var(--color-transparent-wisp-10)]">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
          <MerchDrop />
        </div>
      </section>

      {/* Prizes preview — Summit-style tracks panel */}
      <section id="prizes" className="border-b border-[color:var(--color-transparent-wisp-10)]">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
          <PrizeTracksPanel />
          <div className="mt-10">
            <CtaButton href="/prizes" variant="ghost-wisp" size="md">
              Prize details & judges
            </CtaButton>
          </div>
        </div>
      </section>

      {/* Partners — Breakpoint-style logo wall (before FAQ) */}
      <section id="partners">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionArticle>
            <SectionIntro title="Thank you to our partners" accent="lime" />
            <div className="mt-10">
              <PartnerLogoWall
                anchors={ANCHOR_PARTNERS}
                supporting={SUPPORTING_PARTNERS}
                pending={PENDING_PARTNERS}
              />
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaButton href="https://t.me/semi_infiknight" variant="azure" size="sm">
                Become a partner
              </CtaButton>
              <CtaButton href="/partners" variant="ghost-wisp" size="sm" showArrow={false}>
                Partner details
              </CtaButton>
            </div>
          </SectionArticle>
        </div>
      </section>

      <PreFooterBand />

      {/* FAQ */}
      <section id="faq">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-8 md:pb-10">
          <SectionArticle>
            <SectionIntro title="Before you land" accent="green" />
            <div className="before-you-land__grid mt-10">
              <div className="before-you-land__faq">
                <Accordion
                  items={previewFaq.map((f) => ({
                    id: f.id,
                    title: f.question,
                    content: f.answer,
                  }))}
                />
                <div className="mt-8">
                  <CtaButton href="/faq" variant="ghost-wisp" size="sm" showArrow={false}>
                    All questions
                  </CtaButton>
                </div>
              </div>
              <div className="before-you-land__media">
                <EmbeddedTweetCard tweetId={SITE.beforeYouLandTweetId} />
                <a
                  href={SITE.beforeYouLandTweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="before-you-land__tweet-link"
                >
                  Watch on X
                </a>
              </div>
            </div>
          </SectionArticle>
        </div>
      </section>
    </main>
  );
}
