import { CtaButton, SectionArticle, SectionIntro } from "@borneo/components/ui";
import { PageHeader } from "@borneo/components/shell";
import { SUSTAINABILITY_TRACK_BRIEF } from "@borneo/data/sustainability-track";
import { SUSTAINABILITY_TRACK } from "@borneo/data/tracks";
import { pageMetadata } from "@borneo/lib/metadata";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "Sustainability track",
  description:
    "Farm-to-table challenge for Startup Village Borneo — transparent, efficient and equitable Sarawak agriculture. 2×$500 prizes.",
  path: "/sustainability",
});

function ProseBlock({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="sustainability-prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function SustainabilityPage() {
  const brief = SUSTAINABILITY_TRACK_BRIEF;

  return (
    <main className="site-main site-main--stack track-page sustainability-page">
      <PageHeader title="Sustainability track" lead={brief.lead} />

      <SectionArticle className="bg-[var(--color-azure)] text-[var(--color-wisp)] p-8 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionIntro title={`${SUSTAINABILITY_TRACK.prizes.count}×${SUSTAINABILITY_TRACK.prizes.amount}`} />
            <p className="mt-4 text-[var(--color-wisp)]/80">
              {SUSTAINABILITY_TRACK.total} total · judged on Demo Day · {SUSTAINABILITY_TRACK.partner}-aligned
            </p>
          </div>
          <img
            src={withBasePath("/partners/socoe.png")}
            alt="SOCOE"
            className="h-8 w-auto max-w-[10rem] shrink-0"
            width={160}
            height={32}
            decoding="async"
          />
        </div>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={brief.situation.title} accent="azure" />
        <ProseBlock paragraphs={brief.situation.paragraphs} />
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={brief.challenge.title} accent="byte" />
        <p className="sustainability-prose sustainability-prose--lead">{brief.challenge.intro}</p>
        <ol className="sustainability-directions">
          {brief.challenge.directions.map((direction) => (
            <li key={direction.n} className="sustainability-directions__item">
              <span className="sustainability-directions__n">{direction.n}</span>
              <div>
                <h3 className="sustainability-directions__title">{direction.title}</h3>
                <p className="sustainability-directions__body">{direction.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={brief.hardPart.title} />
        <ProseBlock paragraphs={brief.hardPart.paragraphs} />
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={brief.users.title} accent="azure" />
        <p className="sustainability-prose sustainability-prose--lead">{brief.users.intro}</p>
        <ul className="sustainability-list">
          {brief.users.places.map((place) => (
            <li key={place}>{place}</li>
          ))}
        </ul>
        <p className="sustainability-prose sustainability-prose--closing">{brief.users.closing}</p>
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title={brief.lookingFor.title} accent="byte" />
        <ProseBlock paragraphs={brief.lookingFor.paragraphs} />
      </SectionArticle>

      <SectionArticle>
        <SectionIntro title="How to participate" />
        <ul className="mt-8 flex flex-col gap-4 list-none">
          {SUSTAINABILITY_TRACK.timeline.map((step) => (
            <li
              key={step.when}
              className="grid gap-2 md:grid-cols-[8rem_1fr] border-b border-[color:var(--color-transparent-wisp-10)] pb-4"
            >
              <span className="text-label text-label-accent">{step.when}</span>
              <span className="text-[var(--color-wisp)]/75">{step.what}</span>
            </li>
          ))}
        </ul>
      </SectionArticle>

      <CtaButton href="/tracks" variant="byte" size="md">
        All tracks
      </CtaButton>
    </main>
  );
}
