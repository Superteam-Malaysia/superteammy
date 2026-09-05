import type { Metadata } from "next";
import { RacePageContent } from "@borneo/components/race";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import {
  listParticipantRaceSubmissions,
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

  if (participant) {
    const [initialSubmissions, group] = await Promise.all([
      listParticipantRaceSubmissions(participant.id),
      getParticipantRaceGroup(participant.id),
    ]);

    submission = {
      participantName: participant.name ?? participant.firstName ?? "You",
      initialSubmissions,
      initialGroup: group,
      cutoffPassed: isRaceCutoffPassed(),
    };
  }

  return (
    <main className="site-main site-main--stack race-page-main">
      <RacePageContent
        isSignedIn={!!participant}
        initialFeed={feed}
        submission={submission}
      />
    </main>
  );
}

