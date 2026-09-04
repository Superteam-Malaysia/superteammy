"use client";

import Link from "@borneo/components/Link";
import type { PublicTeam } from "@borneo/lib/teams/types";

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function cardDescription(team: PublicTeam): string {
  return team.description?.trim() || team.tagline?.trim() || "Project details coming soon.";
}

function TeamLogo({ team }: { team: PublicTeam }) {
  if (team.logoUrl) {
    return (
      <div className="team-card__logo team-card__logo--photo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={team.logoUrl} alt="" className="team-card__logo-img" />
      </div>
    );
  }

  return (
    <div className="team-card__logo" aria-hidden="true">
      {teamInitials(team.name)}
    </div>
  );
}

function TeamCard({ team }: { team: PublicTeam }) {
  const category = team.category ?? "Other";
  const visibleMembers = team.members.slice(0, 8);
  const overflowCount = team.memberCount - visibleMembers.length;

  return (
    <Link href={`/teams/${team.slug}`} className="team-card">
      <div className="team-card__inner">
        <div className="team-card__head">
          <TeamLogo team={team} />
          <div className="team-card__title-wrap">
            <h2 className="team-card__name">{team.name}</h2>
            <p className="team-card__meta">
              <span className="team-card__badge">{category}</span>
              <span className="team-card__meta-dot" aria-hidden="true">
                ·
              </span>
              <span>
                {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
              </span>
            </p>
          </div>
        </div>
        <p className="team-card__desc">{cardDescription(team)}</p>
        {team.memberCount > 0 ? (
          <div className="team-card__members" aria-label={`${team.name} members`}>
            {visibleMembers.map((member) => (
              <span key={member.id} className="team-card__member-cell" title={member.name}>
                {member.initials}
              </span>
            ))}
            {overflowCount > 0 ? (
              <span className="team-card__member-cell team-card__member-cell--more">+{overflowCount}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function TeamEcosystemClient({ teams }: { teams: PublicTeam[] }) {
  if (teams.length === 0) {
    return <p className="team-ecosystem__empty">No teams yet.</p>;
  }

  return (
    <div className="team-ecosystem">
      <ul className="team-ecosystem__grid">
        {teams.map((team) => (
          <li key={team.id}>
            <TeamCard team={team} />
          </li>
        ))}
      </ul>
    </div>
  );
}
