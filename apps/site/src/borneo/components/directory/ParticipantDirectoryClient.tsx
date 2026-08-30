"use client";

import { BuilderCard } from "@borneo/components/directory/BuilderCard";
import type { PublicParticipant } from "@borneo/lib/participants/types";

export function ParticipantDirectoryClient({ people }: { people: PublicParticipant[] }) {
  return (
    <div className="builder-directory">
      <ul className="builder-directory__grid">
        {people.map((person) => (
          <li key={person.id}>
            <BuilderCard person={person} />
          </li>
        ))}
      </ul>
    </div>
  );
}
