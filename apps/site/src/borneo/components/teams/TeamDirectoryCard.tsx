"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "@borneo/components/Link";
import { ScalableCardWrapper } from "@/components/members/ScalableCardWrapper";
import type { PublicTeam } from "@borneo/lib/teams/types";

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function cardDescription(team: PublicTeam): string | null {
  return team.description?.trim() || team.tagline?.trim() || null;
}

type TeamDirectoryCardProps = {
  team: PublicTeam;
  index?: number;
};

/** Trading-card shell with gray blueprint texture — links to the team detail page. */
export function TeamDirectoryCard({ team, index = 0 }: TeamDirectoryCardProps) {
  const category = team.category ?? "Other";
  const visibleMembers = team.members.slice(0, 6);
  const overflowCount = team.memberCount - visibleMembers.length;

  return (
    <ScalableCardWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="w-[320px]"
      >
        <Link href={`/teams/${team.slug}`} className="team-directory-card">
          <div className="team-directory-card__surface">
            <div className="team-directory-card__header">
              <Image
                src="/superteam.svg"
                alt="Superteam Malaysia"
                width={156}
                height={24}
                className="h-6 w-auto opacity-80"
              />
              <span className="team-directory-card__badge">{category}</span>
            </div>

            <div className="team-directory-card__rule" aria-hidden="true">
              <span className="team-directory-card__rule-dot" />
              <span className="team-directory-card__rule-line" />
              <span className="team-directory-card__rule-dot" />
            </div>

            <div className="team-directory-card__logo-wrap">
              {team.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logoUrl} alt="" className="team-directory-card__logo-img" />
              ) : (
                <span className="team-directory-card__logo-fallback">{teamInitials(team.name)}</span>
              )}
            </div>

            <h3 className="team-directory-card__name">{team.name}</h3>
            <p className="team-directory-card__meta">
              {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
            </p>

            {cardDescription(team) ? (
              <p className="team-directory-card__desc">{cardDescription(team)}</p>
            ) : null}

            {team.memberCount > 0 ? (
              <div className="team-directory-card__members" aria-label={`${team.name} members`}>
                {visibleMembers.map((member) => (
                  <span key={member.id} className="team-directory-card__member-cell" title={member.name}>
                    {member.initials}
                  </span>
                ))}
                {overflowCount > 0 ? (
                  <span className="team-directory-card__member-cell team-directory-card__member-cell--more">
                    +{overflowCount}
                  </span>
                ) : null}
              </div>
            ) : null}

            <p className="team-directory-card__cta">View team →</p>
          </div>
        </Link>
      </motion.div>
    </ScalableCardWrapper>
  );
}
