import { teamDisplayLogoUrl } from "@borneo/data/demo-day-decks";
import { teamPageCopy } from "@borneo/data/demo-day-pitch-copy";
import { TeamPitchDeck } from "@borneo/components/teams/TeamPitchDeck";
import type { PublicTeam } from "@borneo/lib/teams/types";

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

type TeamDetailPublicViewProps = {
  team: PublicTeam;
};

export function TeamDetailPublicView({ team }: TeamDetailPublicViewProps) {
  const copy = teamPageCopy(team);
  const websiteUrl = copy.websiteUrl;
  const logoUrl = teamDisplayLogoUrl(team.slug, team.logoUrl);

  return (
    <>
      <div className="team-detail__hero">
        <div className="team-detail__logo-frame">
          <span className="team-detail__logo-corner team-detail__logo-corner--tl" />
          <span className="team-detail__logo-corner team-detail__logo-corner--tr" />
          <span className="team-detail__logo-corner team-detail__logo-corner--bl" />
          <span className="team-detail__logo-corner team-detail__logo-corner--br" />
          <div className="team-detail__logo" aria-hidden="true">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="team-detail__logo-img" />
            ) : (
              teamInitials(copy.name)
            )}
          </div>
        </div>

        <div>
          <h1 className="team-detail__title">{copy.name}</h1>
          {copy.tagline ? <p className="team-detail__tagline">{copy.tagline}</p> : null}
          <p className="team-detail__meta">
            <span className="team-detail__badge">{copy.category}</span>
            <span aria-hidden="true">·</span>
            <span>
              {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
            </span>
          </p>

          {websiteUrl ? (
            <div className="team-detail__links">
              <a
                href={websiteUrl}
                className="team-detail__link-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
                <ExternalIcon />
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {copy.description?.trim() ? (
        <div className="team-detail__description">
          {copy.description
            .trim()
            .split(/\n\n+/)
            .map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
        </div>
      ) : null}

      {copy.highlights.length > 0 ? (
        <ul className="team-detail__facts">
          {copy.highlights.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      ) : null}

      <TeamPitchDeck team={team} />
    </>
  );
}
