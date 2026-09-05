import Link from "@borneo/components/Link";
import { CtaButton } from "@borneo/components/ui";
import type { PublicParticipantTeam } from "@borneo/lib/participants/types";

export type ProfileTeamRow = PublicParticipantTeam & {
  canEdit: boolean;
};

type ProfileTeamsPanelProps = {
  teams: ProfileTeamRow[];
};

export function ProfileTeamsPanel({ teams }: ProfileTeamsPanelProps) {
  const editableTeams = teams.filter((team) => team.canEdit);
  const primaryManage = editableTeams[0];

  return (
    <section className="profile-teams" aria-labelledby="profile-teams-heading">
      <div className="profile-teams__head">
        <h2 id="profile-teams-heading" className="profile-teams__title">
          Hackathon team
        </h2>
        <p className="profile-teams__lead">
          {teams.length > 0
            ? "Your team appears in the directory. Update details and members on the team page."
            : "Create or manage your team here."}
        </p>
      </div>

      {teams.length > 0 ? (
        <ul className="profile-teams__list list-none">
          {teams.map((team) => (
            <li key={team.slug} className="profile-teams__row">
              <div className="profile-teams__meta">
                <p className="profile-teams__name">{team.name}</p>
                <Link href={`/teams/${team.slug}`} className="profile-teams__view">
                  View public page
                </Link>
              </div>
              {team.canEdit ? (
                <CtaButton href={`/teams/${team.slug}`} variant="byte" size="sm" showArrow={false}>
                  Manage team
                </CtaButton>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="profile-teams__empty">
          You are not on a hackathon team yet. Create one to appear in the directory and add members.
        </p>
      )}

      <div className="profile-teams__actions">
        {primaryManage ? (
          <CtaButton href={`/teams/${primaryManage.slug}`} variant="byte" size="md" showArrow={false}>
            Manage team
          </CtaButton>
        ) : teams.length === 0 ? (
          <CtaButton href="/teams/new" variant="byte" size="md" showArrow={false}>
            Create team
          </CtaButton>
        ) : null}
        <Link href="/teams" className="profile-teams__browse">
          Browse teams directory
        </Link>
      </div>
    </section>
  );
}
