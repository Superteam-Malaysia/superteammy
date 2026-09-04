"use client";

import { BuilderCard } from "@borneo/components/directory/BuilderCard";
import type { PublicParticipant } from "@borneo/lib/participants/types";

type TeamMemberCardsProps = {
  members: PublicParticipant[];
};

export function TeamMemberCards({ members }: TeamMemberCardsProps) {
  if (members.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((person, index) => (
        <BuilderCard key={person.id} person={person} index={index} />
      ))}
    </div>
  );
}
