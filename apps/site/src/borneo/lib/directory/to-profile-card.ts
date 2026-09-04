import { mentorSocialUrls, type PublicMentor } from "@borneo/data/mentors";
import type { PublicParticipant } from "@borneo/lib/participants/types";
import { telegramHref } from "@borneo/lib/participants/types";
import type { Profile } from "@/lib/types";

function emptyProfile(id: string): Profile {
  return {
    id,
    user_role: "member",
    nickname: "",
    real_name: "",
    avatar_url: "",
    bio: "",
    twitter_url: "",
    github_url: "",
    linkedin_url: "",
    website_url: "",
    telegram_url: "",
    achievements: "",
    talk_to_me_about: "",
    is_featured: false,
    display_order: 0,
    onboarding_completed: true,
    created_at: new Date(0).toISOString(),
  };
}

export function participantToProfile(person: PublicParticipant): Profile {
  return {
    ...emptyProfile(`borneo-participant-${person.id}`),
    nickname: person.name,
    real_name: person.name,
    avatar_url: person.avatarUrl ?? "",
    twitter_url: person.twitter ?? "",
    linkedin_url: person.linkedin ?? "",
    telegram_url: telegramHref(person.telegram) ?? "",
    companies: person.hackathonTeams.map((team) => ({
      id: team.slug,
      name: team.name,
    })),
    bio: person.projectIdea ?? "",
    talk_to_me_about: person.teamSetup ?? "",
  };
}

export function mentorToProfile(mentor: PublicMentor): Profile {
  const social = mentorSocialUrls(mentor);
  const roles: Profile["roles"] = [];

  if (mentor.isWorkshopLeader) {
    roles.push({ id: `${mentor.id}-workshop`, name: "Workshop leader" });
  }
  if (mentor.isJudge && mentor.judgeRole) {
    roles.push({ id: `${mentor.id}-judge`, name: mentor.judgeRole });
  }

  const workshopBio = mentor.workshops.map((workshop) => workshop.title).join(" · ");

  return {
    ...emptyProfile(`borneo-mentor-${mentor.id}`),
    nickname: mentor.name,
    real_name: mentor.name,
    avatar_url: mentor.avatar ?? "",
    twitter_url: social.twitter ?? "",
    linkedin_url: social.linkedin ?? "",
    telegram_url: social.telegram ?? "",
    companies: mentor.organization ? [{ id: mentor.id, name: mentor.organization }] : [],
    roles,
    bio: workshopBio,
  };
}
