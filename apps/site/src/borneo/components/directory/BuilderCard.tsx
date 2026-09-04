"use client";

import { MemberProfileCard } from "@/components/members/MemberProfileCard";
import { ScalableCardWrapper } from "@/components/members/ScalableCardWrapper";
import { participantToProfile } from "@borneo/lib/directory/to-profile-card";
import type { PublicParticipant } from "@borneo/lib/participants/types";

export type BuilderCardProps = {
  person: PublicParticipant;
  index?: number;
};

export function BuilderCard({ person, index = 0 }: BuilderCardProps) {
  return (
    <ScalableCardWrapper>
      <div id={`builder-${person.id}`}>
        <MemberProfileCard
          profile={participantToProfile(person)}
          index={index}
          expandOnClick
        />
      </div>
    </ScalableCardWrapper>
  );
}
