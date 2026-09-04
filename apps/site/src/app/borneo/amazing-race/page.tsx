import type { Metadata } from "next";
import { RacePageContent } from "@borneo/components/race";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import {
  listParticipantTeams,
  listPublicRaceFeed,
  listTeamRaceSubmissions,
} from "@borneo/lib/race/submissions";
import { isRaceCutoffPassed } from "@borneo/lib/race/validation";

export const metadata: Metadata = {
  title: "Amazing Race · Startup Village Borneo",
  description:
    "Kuching milestone feed — complete race stations, post on X, and paste your link. Hard cutoff Day 4 at 18:00 MYT.",
};

export const dynamic = "force-dynamic";

export default async function AmazingRacePage() {
  const [participant, feed] = await Promise.all([
    getParticipantForSession(),
    listPublicRaceFeed(),
  ]);

  let submission = null;

  if (participant) {
    const teams = await listParticipantTeams(participant.id);
    const initialTeam = teams[0] ?? null;
    const initialSubmissions = initialTeam
      ? await listTeamRaceSubmissions(initialTeam.teamId)
      : [];

    submission = {
      teams,
      initialTeamSlug: initialTeam?.slug ?? null,
      initialSubmissions,
      cutoffPassed: isRaceCutoffPassed(),
    };
  }

  return (
    <main className="site-main site-main--stack race-page-main">
      <RacePageContent
        isSignedIn={!!participant}
        isOrganizer={participant ? isOrganizer(participant) : false}
        initialFeed={feed}
        submission={submission}
      />
    </main>
  );
}

