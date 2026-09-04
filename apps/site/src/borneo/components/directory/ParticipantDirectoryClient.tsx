"use client";

import { BuilderCard } from "@borneo/components/directory/BuilderCard";
import type { PublicParticipant } from "@borneo/lib/participants/types";

export function ParticipantDirectoryClient({ people }: { people: PublicParticipant[] }) {
  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted mb-2">No builders found</p>
        <p className="text-sm text-muted-dark">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {people.map((person, index) => (
        <BuilderCard key={person.id} person={person} index={index} />
      ))}
    </div>
  );
}
