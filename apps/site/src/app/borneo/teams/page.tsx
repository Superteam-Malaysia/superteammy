import type { Metadata } from "next";
import { DirectoryTabsClient } from "@borneo/components/teams/DirectoryTabsClient";
import { parseDirectoryTab } from "@borneo/lib/directory/tabs";
import { getPublicMentors } from "@borneo/data/mentors";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getPublicParticipants } from "@borneo/lib/participants/public-directory";
import { getPublicTeams } from "@borneo/lib/teams/public-teams";

export const metadata: Metadata = {
  title: "Teams & Mentors",
  description:
    "Hackathon teams, registered builders, and on-stage mentors for Startup Village Borneo.",
};

export const dynamic = "force-dynamic";

type TeamsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const params = await searchParams;
  const [teams, people, mentors, participant] = await Promise.all([
    getPublicTeams(),
    getPublicParticipants(),
    Promise.resolve(getPublicMentors()),
    getParticipantForSession(),
  ]);

  return (
    <main className="site-main site-main--directory">
      <DirectoryTabsClient
        initialTab={parseDirectoryTab(params.tab)}
        teams={teams}
        people={people}
        mentors={mentors}
        isSignedIn={!!participant}
      />
    </main>
  );
}
