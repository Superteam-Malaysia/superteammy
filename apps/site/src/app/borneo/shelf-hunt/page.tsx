import { CtaButton, SectionArticle, SectionIntro } from "@borneo/components/ui";
import { PageHeader } from "@borneo/components/shell";
import { SHELF_HUNT } from "@borneo/data/shelf-hunt";
import { pageMetadata } from "@borneo/lib/metadata";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "Shelf Hunt",
  description:
    "GetBlock Shelf Hunt at Startup Village Borneo — two white-label shelf slots for Q4 2026, 50/50 revenue share, and the afternoon assignment.",
  path: "/shelf-hunt",
});

export default function ShelfHuntPage() {
  const track = SHELF_HUNT;

  return (
    <main className="site-main site-main--stack shelf-hunt-page">
      <PageHeader title={track.title} lead={track.lead} />

      <SectionArticle className="bg-[var(--color-azure)] text-[var(--color-wisp)] p-8 md:p-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionIntro title={track.prize.label} />
              <p className="mt-4 text-[var(--color-wisp)]/80">{track.prize.closes}</p>
              <p className="mt-2 text-sm text-[var(--color-wisp)]/65">{track.workshop}</p>
            </div>
            <img
              src={withBasePath("/partners/getblock.svg")}
              alt="GetBlock"
              className="h-8 w-auto max-w-[11rem] shrink-0 brightness-0 invert"
              width={182}
              height={32}
              decoding="async"
            />
          </div>
          <dl className="shelf-hunt-stats">
            {track.stats.map((stat) => (
              <div key={stat.label} className="shelf-hunt-stats__item">
                <dt className="shelf-hunt-stats__value">{stat.value}</dt>
                <dd className="shelf-hunt-stats__label">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={track.prize.headline} accent="azure" />
        <p className="sustainability-prose sustainability-prose--lead">
          Partners put their own product into GetBlock&apos;s console and split revenue 50/50. GetBlock
          brings billing, support, marketing, legal, and roughly 115,000 developers a month — 92% arriving
          without paid acquisition.
        </p>
      </SectionArticle>

      <SectionArticle>
        <div className="shelf-hunt-columns">
          <div>
            <SectionIntro title="We bring" accent="byte" />
            <ul className="sustainability-list">
              {track.weBring.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionIntro title="You bring" accent="azure" />
            <ul className="sustainability-list">
              {track.youBring.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title="Not a fit" />
        <ul className="sustainability-list">
          {track.notAFit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={track.application.title} accent="byte" />
        <ol className="sustainability-directions">
          {track.application.fields.map((field, index) => (
            <li key={field.slice(0, 40)} className="sustainability-directions__item">
              <span className="sustainability-directions__n">{index + 1}</span>
              <p className="sustainability-directions__body">{field}</p>
            </li>
          ))}
        </ol>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={track.assignment.title} accent="azure" />
        <p className="sustainability-prose sustainability-prose--lead">{track.assignment.intro}</p>
        <ol className="sustainability-directions">
          {track.assignment.steps.map((step) => (
            <li key={step.n} className="sustainability-directions__item">
              <span className="sustainability-directions__n">{step.n}</span>
              <div>
                <h3 className="sustainability-directions__title">
                  {step.title}
                  <span className="shelf-hunt-step-time">{step.duration}</span>
                </h3>
                <p className="sustainability-directions__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionArticle>

      <SectionArticle>
        <blockquote className="shelf-hunt-quote">{track.caseStudy.quote}</blockquote>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title="Paste into Cursor, Claude Code, or any agent with repo access" accent="byte" />
        <pre className="shelf-hunt-prompt">{track.agentPrompt}</pre>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title="Reach Vasily" accent="azure" />
        <p className="sustainability-prose sustainability-prose--lead">
          {track.contact.name} · {track.contact.role}
        </p>
        <p className="sustainability-prose">{track.contact.tagline}</p>
        <ul className="shelf-hunt-contact list-none">
          <li>
            <span className="text-label">Telegram</span>
            <a href={track.contact.telegram.url} className="shelf-hunt-contact__link">
              {track.contact.telegram.handle}
            </a>
          </li>
          <li>
            <span className="text-label">Email</span>
            <a href={`mailto:${track.contact.email}`} className="shelf-hunt-contact__link">
              {track.contact.email}
            </a>
          </li>
          <li>
            <span className="text-label">More</span>
            <a href={track.contact.web.url} className="shelf-hunt-contact__link" target="_blank" rel="noopener noreferrer">
              {track.contact.web.label}
            </a>
          </li>
          <li>
            <span className="text-label">In person</span>
            <span className="shelf-hunt-contact__text">{track.contact.inPerson}</span>
          </li>
        </ul>
      </SectionArticle>

      <div className="flex flex-wrap gap-4">
        <CtaButton href={track.contact.telegram.url} variant="byte" size="md" external>
          Message on Telegram
        </CtaButton>
        <CtaButton href={track.externalUrl} variant="ghost-wisp" size="md" external>
          Full brief on GetBlock
        </CtaButton>
        <CtaButton href="/prizes" variant="ghost-null" size="md">
          All prizes
        </CtaButton>
      </div>
    </main>
  );
}
