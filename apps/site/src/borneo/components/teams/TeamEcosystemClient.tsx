"use client";

import { TeamDirectoryCard } from "@borneo/components/teams/TeamDirectoryCard";
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
        <TeamDirectoryCard key={team.id} team={team} index={index} />
      ))}
    </div>
  );
}
