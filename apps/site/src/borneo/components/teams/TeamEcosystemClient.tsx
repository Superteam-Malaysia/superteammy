"use client";

import { MemberProfileCard } from "@/components/members/MemberProfileCard";
import { ScalableCardWrapper } from "@/components/members/ScalableCardWrapper";
import { withBasePath } from "@borneo/lib/base-path";
import { teamToProfile } from "@borneo/lib/directory/to-profile-card";
import type { PublicTeam } from "@borneo/lib/teams/types";

export function TeamEcosystemClient({ teams }: { teams: PublicTeam[] }) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted mb-2">No teams found</p>
        <p className="text-sm text-muted-dark">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teams.map((team, index) => (
        <ScalableCardWrapper key={team.id}>
          <MemberProfileCard
            profile={teamToProfile(team)}
            index={index}
            expandOnClick
            detailHref={withBasePath(`/teams/${team.slug}`)}
            detailLabel="View team"
            achievementsLabel="Members"
          />
        </ScalableCardWrapper>
      ))}
    </div>
  );
}
