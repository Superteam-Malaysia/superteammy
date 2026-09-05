import { DEMO_DAY_JUDGES } from "@borneo/data/judges";
import { WORKSHOP_SESSIONS } from "@borneo/data/speakers";
import { withBasePath } from "@borneo/lib/base-path";
import { participantInitials } from "@borneo/lib/participants/team-categories";
import type { PublicMentor, PublicMentorWorkshop } from "@borneo/lib/mentors/types";

export type { PublicMentor, PublicMentorWorkshop } from "@borneo/lib/mentors/types";

/** Organizers / mentors shown in the directory but not tied to a workshop slot. */
const STANDALONE_MENTORS: PublicMentor[] = [
  {
    id: "han",
    name: "Han",
    organization: "Superteam Malaysia",
    isWorkshopLeader: false,
    isJudge: false,
    judgeRole: null,
    workshops: [],
    avatar: null,
    twitter: "hanstmy",
    linkedin: null,
    telegram: "hanstmy",
    email: null,
    initials: participantInitials("Han"),
  },
  {
    id: "marianne",
    name: "Marianne",
    organization: "Superteam Malaysia",
    isWorkshopLeader: false,
    isJudge: false,
    judgeRole: null,
    workshops: [],
    avatar: null,
    twitter: "tuakdotsol",
    linkedin: null,
    telegram: "tuakdotsol",
    email: null,
    initials: participantInitials("Marianne"),
  },
  {
    id: "semi",
    name: "Semi",
    organization: "Superteam Malaysia",
    isWorkshopLeader: false,
    isJudge: false,
    judgeRole: null,
    workshops: [],
    avatar: null,
    twitter: null,
    linkedin: null,
    telegram: "semi_infiknight",
    email: "semi@sendarcade.fun",
    initials: participantInitials("Semi"),
  },
];

/** Extra contact / directory fields not in the speakers schedule export. */
const MENTOR_CONTACT: Record<
  string,
  { email?: string; telegram?: string; organization?: string }
> = {
  han: {
    telegram: "hanstmy",
    organization: "Superteam Malaysia",
  },
  marianne: {
    telegram: "tuakdotsol",
    organization: "Superteam Malaysia",
  },
  semi: {
    email: "semi@sendarcade.fun",
    telegram: "semi_infiknight",
    organization: "Superteam Malaysia",
  },
  nikki: {
    telegram: "nikkideyy",
    organization: "stmy",
  },
  tristan: { telegram: "hypetris_" },
  vesper: { telegram: "vesper792" },
  jemmy: { telegram: "jemmmyjemm" },
  nic: { telegram: "NicFury" },
  ohmeohmy: { telegram: "OhMeOhMy_Sol" },
  joey: { telegram: "joeylaujy" },
  "shuen-rui": { telegram: "shuenrui" },
};

/** Best Telegram @handle for a mentor — explicit field, contact map, then X handle. */
export function mentorTelegramHandle(mentor: PublicMentor): string | null {
  if (mentor.telegram?.trim()) {
    return mentor.telegram.replace(/^@/, "").trim();
  }
  const contact = MENTOR_CONTACT[mentor.id];
  if (contact?.telegram?.trim()) {
    return contact.telegram.replace(/^@/, "").trim();
  }
  if (mentor.twitter?.trim()) {
    return mentor.twitter.replace(/^@/, "").trim();
  }
  return null;
}

export function mentorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Deep link into the mentors directory tab for a workshop leader or judge. */
export function mentorDirectoryHref(mentorId: string): string {
  return withBasePath(`/teams?tab=mentors#mentor-${mentorId}`);
}

/** Mentor directory ids — never shown as hackathon team cards. */
export function getMentorDirectoryIds(): ReadonlySet<string> {
  return new Set(getPublicMentors().map((mentor) => mentor.id));
}

export function isMentorTeamSlug(slug: string, teamName?: string | null): boolean {
  const mentorIds = getMentorDirectoryIds();
  if (mentorIds.has(slug)) return true;
  if (teamName) {
    const fromName = mentorSlug(teamName);
    if (fromName && mentorIds.has(fromName)) return true;
  }
  return false;
}

function twitterHref(handle: string | null): string | null {
  if (!handle?.trim()) return null;
  const clean = handle.replace(/^@/, "").trim();
  return clean ? `https://x.com/${clean}` : null;
}

function linkedinHref(slug: string | null): string | null {
  if (!slug?.trim()) return null;
  return `https://www.linkedin.com/in/${slug.replace(/^\/+|\/+$/g, "")}`;
}

function telegramHref(value: string | null): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return handle ? `https://t.me/${handle}` : null;
}

export function mentorConnectHref(mentor: PublicMentor): string | null {
  return (
    twitterHref(mentor.twitter) ??
    telegramHref(mentor.telegram) ??
    linkedinHref(mentor.linkedin) ??
    (mentor.email ? `mailto:${mentor.email}` : null)
  );
}

export function mentorConnectLabel(mentor: PublicMentor): string {
  if (twitterHref(mentor.twitter)) return "Twitter";
  if (telegramHref(mentor.telegram)) return "Telegram";
  if (linkedinHref(mentor.linkedin)) return "LinkedIn";
  if (mentor.email) return "Email";
  return "Connect";
}

export function mentorSocialUrls(mentor: PublicMentor) {
  return {
    twitter: twitterHref(mentor.twitter),
    linkedin: linkedinHref(mentor.linkedin),
    telegram: telegramHref(mentor.telegram),
    email: mentor.email ? `mailto:${mentor.email}` : null,
  };
}

/** Workshop leaders + Demo Day judges for the mentors directory. */
export function getPublicMentors(): PublicMentor[] {
  const byId = new Map<string, PublicMentor>();

  for (const session of WORKSHOP_SESSIONS) {
    const id = mentorSlug(session.speaker);
    const workshop: PublicMentorWorkshop = {
      title: session.title,
      dayLabel: session.dayLabel,
      date: session.date,
      start: session.start,
    };
    const contact = MENTOR_CONTACT[id];
    const existing = byId.get(id);

    if (existing) {
      existing.workshops.push(workshop);
      if (session.organization && !existing.organization) {
        existing.organization = session.organization;
      }
      if (session.avatar && !existing.avatar) existing.avatar = session.avatar;
      if (session.twitter && !existing.twitter) existing.twitter = session.twitter;
      if (session.linkedin && !existing.linkedin) existing.linkedin = session.linkedin;
      continue;
    }

    byId.set(id, {
      id,
      name: session.speaker,
      organization: session.organization ?? null,
      isWorkshopLeader: true,
      isJudge: false,
      judgeRole: null,
      workshops: [workshop],
      avatar: session.avatar ?? null,
      twitter: session.twitter ?? null,
      linkedin: session.linkedin ?? null,
      telegram: contact?.telegram ?? null,
      email: contact?.email ?? null,
      initials: participantInitials(session.speaker),
    });
  }

  for (const judge of DEMO_DAY_JUDGES) {
    const contact = MENTOR_CONTACT[judge.id];
    const existing = byId.get(judge.id);

    if (existing) {
      existing.isJudge = true;
      existing.judgeRole = judge.role;
      if (judge.photo && !existing.avatar) existing.avatar = judge.photo;
      if (!existing.organization) existing.organization = judge.role;
      continue;
    }

    byId.set(judge.id, {
      id: judge.id,
      name: judge.name,
      organization: judge.role,
      isWorkshopLeader: false,
      isJudge: true,
      judgeRole: judge.role,
      workshops: [],
      avatar: judge.photo ?? null,
      twitter: null,
      linkedin: null,
      telegram: contact?.telegram ?? null,
      email: contact?.email ?? null,
      initials: participantInitials(judge.name),
    });
  }

  for (const mentor of STANDALONE_MENTORS) {
    if (byId.has(mentor.id)) continue;
    byId.set(mentor.id, mentor);
  }

  for (const mentor of byId.values()) {
    const contact = MENTOR_CONTACT[mentor.id];
    if (contact?.organization) mentor.organization = contact.organization;
    if (contact?.email && !mentor.email) mentor.email = contact.email;
    const telegram = mentorTelegramHandle(mentor);
    if (telegram) mentor.telegram = telegram;
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
