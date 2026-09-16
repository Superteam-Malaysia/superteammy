"use client";

import { useState } from "react";
import {
  deckMappingForSlug,
  // deckSlidePathsForSlug,
  demoDayPdfUrl,
  demoDayPreviewUrl,
  demoDayTeamEmbedUrl,
  demoDayTeamViewUrl,
} from "@borneo/data/demo-day-decks";
// import { TeamPitchSlideshow } from "@borneo/components/teams/TeamPitchSlideshow";
import type { PublicTeam } from "@borneo/lib/teams/types";

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type TeamPitchDeckProps = {
  team: PublicTeam;
};

/**
 * Staging experiment: per-team Canva embeds via `designId` (click-to-load).
 * Image slideshow path kept commented so we can flip back without a hunt.
 */
export function TeamPitchDeck({ team }: TeamPitchDeckProps) {
  const [embedReady, setEmbedReady] = useState(false);
  const mapping = deckMappingForSlug(team.slug);
  // const slides = mapping ? deckSlidePathsForSlug(mapping.slug) : [];
  const pdfSrc = mapping ? demoDayPdfUrl(mapping.slug) : null;
  const previewSrc = mapping ? demoDayPreviewUrl(mapping.slug) : null;
  const canvaViewUrl = mapping ? demoDayTeamViewUrl(mapping.designId) : null;
  const canvaEmbedUrl = mapping ? demoDayTeamEmbedUrl(mapping.designId) : null;
  const fallbackUrl = team.deckUrl;

  // if (slides.length > 0) {
  //   return (
  //     <section className="team-detail__deck" aria-labelledby={`${team.slug}-pitch-deck`}>
  //       <div className="team-detail__deck-header">
  //         <h2 id={`${team.slug}-pitch-deck`} className="team-detail__section-label">
  //           Demo Day pitch
  //         </h2>
  //         {pdfSrc ? (
  //           <a
  //             href={pdfSrc}
  //             className="team-detail__link-btn team-detail__link-btn--muted"
  //             target="_blank"
  //             rel="noopener noreferrer"
  //           >
  //             Download PDF
  //             <ExternalIcon />
  //           </a>
  //         ) : null}
  //       </div>
  //       <TeamPitchSlideshow slides={slides} teamName={team.name} />
  //     </section>
  //   );
  // }

  let embedSrc: string;
  let openHref: string;
  let openLabel: string;
  if (canvaEmbedUrl && canvaViewUrl) {
    embedSrc = canvaEmbedUrl;
    openHref = canvaViewUrl;
    openLabel = "Open in Canva";
  } else if (fallbackUrl) {
    embedSrc = fallbackUrl.replace("/view", "/view?embed");
    openHref = fallbackUrl;
    openLabel = "Open deck";
  } else {
    return null;
  }

  return (
    <section className="team-detail__deck" aria-labelledby={`${team.slug}-pitch-deck`}>
      <div className="team-detail__deck-header">
        <h2 id={`${team.slug}-pitch-deck`} className="team-detail__section-label">
          Demo Day pitch
        </h2>
        <div className="team-detail__deck-actions">
          {pdfSrc ? (
            <a
              href={pdfSrc}
              className="team-detail__link-btn team-detail__link-btn--muted"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
              <ExternalIcon />
            </a>
          ) : null}
          <a
            href={openHref}
            className="team-detail__link-btn team-detail__link-btn--muted"
            target="_blank"
            rel="noopener noreferrer"
          >
            {openLabel}
            <ExternalIcon />
          </a>
        </div>
      </div>
      <div className="team-detail__deck-frame">
        {embedReady ? (
          <iframe
            title={`${team.name} Demo Day pitch deck`}
            src={embedSrc}
            allow="fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="team-detail__deck-load"
            onClick={() => setEmbedReady(true)}
          >
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                className="team-detail__deck-preview"
                width={596}
                height={336}
              />
            ) : null}
            <span className="team-detail__deck-load-scrim" aria-hidden="true" />
            <span className="team-detail__deck-load-copy">
              <span className="team-detail__deck-load-title">Load deck</span>
              <span className="team-detail__deck-load-hint">Opens the Canva slides in place.</span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
