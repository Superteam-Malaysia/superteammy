import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamDetailActions } from "@borneo/components/teams/TeamDetailActions";
import { TeamDetailPublicView } from "@borneo/components/teams/TeamDetailPublicView";
import { TeamManageSection } from "@borneo/components/teams/TeamManageSection";
import { TeamMemberCards } from "@borneo/components/teams/TeamMemberCards";
import { SectionArticle } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { getPublicParticipantsByIds } from "@borneo/lib/participants/public-directory";
import { requireTeamEditor } from "@borneo/lib/teams/access";
import { getPublicTeamBySlug, getTeamRecordBySlug } from "@borneo/lib/teams/public-teams";
import { getDb } from "@borneo/lib/db";
import { teams } from "@borneo/lib/db/schema";

export const dynamic = "force-dynamic";

type TeamDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];

  try {
    const db = getDb();
    const rows = await db.select({ slug: teams.slug }).from(teams);
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const team = await getPublicTeamBySlug(slug);
  if (!team) return { title: "Team not found" };
  return {
    title: team.name,
    description: team.tagline ?? team.description ?? `${team.name} — SVB 2026`,
  };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slug } = await params;
  const team = await getPublicTeamBySlug(slug);
  if (!team) notFound();

  const memberIds = team.members.map((m) => m.id);
  const memberProfiles = await getPublicParticipantsByIds(memberIds);

  const participant = await getParticipantForSession();
  const record = await getTeamRecordBySlug(slug);
  const canEdit =
    participant && record
      ? Boolean(await requireTeamEditor(record.id, participant.id))
      : false;

  return (
    <main className="site-main site-main--stack">
      <div className="max-w-[90rem] mx-auto px-4 md:px-8 py-16 md:py-24 w-full">
        <SectionArticle>
          <div className="team-detail">
            <Link href="/teams" className="team-detail__back">
              <span aria-hidden="true">&lt;</span> Back to teams
            </Link>

            {canEdit ? (
              <>
                <h1 className="team-detail__title team-detail__title--manage">Edit {team.name}</h1>
                <p className="team-detail__manage-lead">
                  Update your team profile, logo, links, and members below.
                </p>
                <TeamManageSection slug={slug} team={team} />
              </>
            ) : (
              <TeamDetailPublicView team={team} />
            )}

            {!canEdit ? (
              <section className="team-detail__members">
                <h2 className="team-detail__section-label">Team</h2>
                <TeamMemberCards members={memberProfiles} />
              </section>
            ) : null}

            {!canEdit ? <TeamDetailActions slug={slug} /> : null}
          </div>
        </SectionArticle>
      </div>
    </main>
  );
}
