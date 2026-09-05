import type { Metadata } from "next";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { LogoutButton } from "@borneo/components/auth/LogoutButton";
import { ProfileEditForm } from "@borneo/components/profile/ProfileEditForm";
import { ProfileAdminLinks } from "@borneo/components/profile/ProfileAdminLinks";
import { ProfileTeamsPanel } from "@borneo/components/profile/ProfileTeamsPanel";
import { requireParticipant } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import { participantInitials } from "@borneo/lib/participants/team-categories";
import { participantToProfileForm } from "@borneo/lib/profile/form";
import { canEditTeam, getParticipantHackathonTeams } from "@borneo/lib/teams/access";
import { uploadPublicUrl } from "@borneo/lib/uploads/public-url";

export const metadata: Metadata = {
  title: "My profile",
  description: "Your Startup Village Borneo participant profile.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const participant = await requireParticipant();
  const teamRows = await getParticipantHackathonTeams(participant.id);
  const displayName = participant.name ?? participant.email;
  const initials = participantInitials(displayName);
  const avatarUrl = uploadPublicUrl(participant.avatarUrl);
  const hackathonTeams = teamRows.map(({ slug, name }) => ({ slug, name }));
  const profileTeams = teamRows.map((team) => ({
    slug: team.slug,
    name: team.name,
    canEdit: canEditTeam(team.role),
  }));

  return (
    <main className="site-main site-main--stack">
      <SectionArticle>
          <SectionIntro
            title="My profile"
            lead="Update your builder card and manage your hackathon team."
            accent="green"
          />

          <div className="mt-10">
            <ProfileTeamsPanel teams={profileTeams} />
          </div>

          <div className="mt-10">
            <ProfileEditForm
              participantId={participant.id}
              initial={participantToProfileForm(participant)}
              meta={{
                email: participant.email,
                approvalStatus: participant.approvalStatus,
                ticketName: participant.ticketName,
              }}
              avatarFallback={initials}
              avatarUrl={avatarUrl}
              hackathonTeams={hackathonTeams}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {isOrganizer(participant) ? <ProfileAdminLinks /> : null}
            <LogoutButton />
          </div>
        </SectionArticle>
    </main>
  );
}
