import { isHiddenDirectoryParticipant } from "@borneo/data/directory-exclusions";
import { isMentorParticipant } from "@borneo/data/mentors";
import type { PublicParticipant } from "./types";

/** Builders with no hackathon team — mentors/judges/ops staff stay off this list. */
export function getUnassignedBuilders(people: PublicParticipant[]): PublicParticipant[] {
  return people.filter(
    (person) =>
      person.hackathonTeams.length === 0 &&
      !isHiddenDirectoryParticipant({
        telegram: person.telegram,
      }) &&
      !isMentorParticipant({
        name: person.name,
        telegram: person.telegram,
        twitter: person.twitter,
      }),
  );
}
