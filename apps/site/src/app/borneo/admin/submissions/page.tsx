import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminRaceLeaderboard } from "@borneo/components/race/AdminRaceLeaderboard";
import { AdminSubmissionsTable } from "@borneo/components/race/AdminSubmissionsTable";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import { getRaceLeaderboard } from "@borneo/lib/race/leaderboard";
import { listAllRaceSubmissionsForAdmin } from "@borneo/lib/race/submissions";

export const metadata: Metadata = {
  title: "Race submissions · Admin",
  description: "Review Amazing Race thread URLs submitted by teams.",
};

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const participant = await getParticipantForSession();
  if (!participant || !isOrganizer(participant)) notFound();

  const [submissions, leaderboard] = await Promise.all([
    listAllRaceSubmissionsForAdmin(),
    getRaceLeaderboard(),
  ]);

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Race submissions"
        lead="Thread URLs submitted by teams for Amazing Race stations. Only organizers can view this page."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro title="Leaderboard" accent="byte" />
        <p className="mt-2 text-sm text-[color:var(--color-transparent-wisp-55)]">
          Team standings by base points — variable milestone bonuses not included.
        </p>
        <div className="mt-6">
          <AdminRaceLeaderboard rows={leaderboard} />
        </div>
      </SectionArticle>

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro title={`${submissions.length} submission${submissions.length === 1 ? "" : "s"}`} accent="green" />
        <p className="mt-2 text-sm text-[color:var(--color-transparent-wisp-55)]">
          Grouped by Amazing Race team, ordered by leaderboard rank.
        </p>
        <div className="mt-8">
          <AdminSubmissionsTable submissions={submissions} leaderboard={leaderboard} />
        </div>
      </SectionArticle>
    </main>
  );
}
