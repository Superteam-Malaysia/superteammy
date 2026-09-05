import type { Metadata } from "next";
import { RacePageContent } from "@borneo/components/race";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import {
  listParticipantRaceSubmissions,
  listParticipantTeams,
  listPublicRaceFeed,
} from "@borneo/lib/race/submissions";
import { getParticipantRaceGroup } from "@borneo/lib/race/groups";
import { isRaceCutoffPassed } from "@borneo/lib/race/validation";

export const metadata: Metadata = {
  title: "Amazing Race · Startup Village Borneo",
  description:
    "Kuching milestone feed — complete race stations, post on X, and paste your link.",
};

export const dynamic = "force-dynamic";

export default async function AmazingRacePage() {
  const [participant, feed] = await Promise.all([
    getParticipantForSession(),
    listPublicRaceFeed(),
  ]);

  let submission = null;
  let initialGroup = null;

  if (participant) {
    const [teams, initialSubmissions, group] = await Promise.all([
      listParticipantTeams(participant.id),
      listParticipantRaceSubmissions(participant.id),
      getParticipantRaceGroup(participant.id),
    ]);
    const initialTeam = teams[0] ?? null;
    initialGroup = group;

    submission = {
      participantName: participant.name ?? participant.firstName ?? "You",
      teams,
      tagTeamSlug: initialTeam?.slug ?? null,
      initialSubmissions,
      cutoffPassed: isRaceCutoffPassed(),
    };
  }

  return (
    <main className="site-main site-main--stack race-page-main">
      <RacePageContent
        isSignedIn={!!participant}
        initialFeed={feed}
        initialGroup={initialGroup}
        submission={submission}
      />
    </main>
  );
}

