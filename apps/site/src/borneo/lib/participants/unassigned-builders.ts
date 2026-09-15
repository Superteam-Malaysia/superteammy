import { isMentorParticipant } from "@borneo/data/mentors";
import type { PublicParticipant } from "./types";

/** Builders with no hackathon team — mentors/judges stay on the Mentors tab only. */
export function getUnassignedBuilders(people: PublicParticipant[]): PublicParticipant[] {
  return people.filter(
    (person) =>
      person.hackathonTeams.length === 0 &&
      !isMentorParticipant({
        name: person.name,
        telegram: person.telegram,
        twitter: person.twitter,
      }),
  );
}
