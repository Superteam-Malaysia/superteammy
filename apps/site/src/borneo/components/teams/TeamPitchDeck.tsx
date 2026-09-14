"use client";

import { useState } from "react";
import { deckMappingForSlug, demoDayPdfUrl } from "@borneo/data/demo-day-decks";
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

export function TeamPitchDeck({ team }: TeamPitchDeckProps) {
  const [embedReady, setEmbedReady] = useState(false);
  const mapping = deckMappingForSlug(team.slug);
  const pdfSrc = mapping ? demoDayPdfUrl(mapping.slug) : null;
  const fallbackUrl = team.deckUrl;

  let embedSrc: string;
  let openHref: string;
  if (pdfSrc) {
    embedSrc = pdfSrc;
    openHref = pdfSrc;
  } else if (fallbackUrl) {
    embedSrc = fallbackUrl.replace("/view", "/view?embed");
    openHref = fallbackUrl;
  } else {
    return null;
  }

  return (
    <section className="team-detail__deck" aria-labelledby={`${team.slug}-pitch-deck`}>
      <div className="team-detail__deck-header">
        <h2 id={`${team.slug}-pitch-deck`} className="team-detail__section-label">
          Demo Day pitch
        </h2>
        <a
          href={openHref}
          className="team-detail__link-btn team-detail__link-btn--muted"
          target="_blank"
          rel="noopener noreferrer"
        >
          {pdfSrc ? "Open PDF" : "Open deck"}
          <ExternalIcon />
        </a>
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
            <span className="team-detail__deck-load-title">Load full pitch</span>
            <span className="team-detail__deck-load-hint">
              Numbers, GTM, and the ask. The page above is the brief.
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
