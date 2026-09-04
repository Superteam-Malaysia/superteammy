"use client";

import { PeopleCard } from "@borneo/components/directory/PeopleCard";
import Link from "@borneo/components/Link";
import type { PublicParticipant } from "@borneo/lib/participants/types";
import { telegramHref } from "@borneo/lib/participants/types";

export type BuilderCardProps = {
  person: PublicParticipant;
  badge?: string | null;
};

export function BuilderCard({ person, badge = null }: BuilderCardProps) {
  const teams = person.hackathonTeams;

  const subtitleLines =
    teams.length > 0
      ? [
          teams.map((team, index) => (
            <span key={team.slug}>
              {index > 0 ? ", " : null}
              <Link href={`/teams/${team.slug}`} className="people-card__inline-link">
                {team.name}
              </Link>
            </span>
          )),
        ]
      : [];

  return (
    <PeopleCard
      id={`builder-${person.id}`}
      name={person.name}
      avatarUrl={person.avatarUrl}
      initials={person.initials}
      badge={badge}
      subtitleLines={subtitleLines}
      social={{
        twitter: person.twitter,
        linkedin: person.linkedin,
        telegram: telegramHref(person.telegram),
      }}
    />
  );
}
