import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamForm } from "@borneo/components/teams";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getParticipantHackathonTeams } from "@borneo/lib/teams/access";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata: Metadata = {
  title: "Create team",
  description: "Create a hackathon team for Startup Village Borneo.",
};

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const participant = await getParticipantForSession();
  if (!participant) redirect(withBasePath("/login"));

  const existingTeams = await getParticipantHackathonTeams(participant.id);
  if (existingTeams.length > 0) {
    redirect(withBasePath(`/teams/${existingTeams[0].slug}`));
  }

  return (
    <main className="site-main site-main--stack">
      <SectionArticle>
          <SectionIntro
            title="Create a team"
            lead="Showcase your project in the teams directory. Create and manage teams from your profile."
            accent="byte"
          />
          <div className="mt-10">
            <TeamForm mode="create" />
          </div>
        </SectionArticle>
    </main>
  );
}
