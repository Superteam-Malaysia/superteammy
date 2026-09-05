import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamForm } from "@borneo/components/teams";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata: Metadata = {
  title: "Create team",
  description: "Create a hackathon team for Startup Village Borneo.",
};

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const participant = await getParticipantForSession();
  if (!participant) redirect(withBasePath("/login"));

  return (
    <main className="site-main site-main--stack">
      <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24">
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
      </div>
    </main>
  );
}
