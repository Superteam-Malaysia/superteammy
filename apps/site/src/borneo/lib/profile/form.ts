import { nullableSocialUrl } from "./social-urls";

export type ProfileFormValues = {
  name: string;
  phoneNumber: string;
  telegram: string;
  twitterUrl: string;
  instagramUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  projectIdea: string;
  proofOfWork: string;
  teamSetup: string;
  commitmentProof: string;
  jerseySize: string;
  ownAccommodation: string;
};

export type ProfileReadonlyMeta = {
  email: string;
  approvalStatus: string | null;
  ticketName: string | null;
};

export const PROFILE_FIELD_LIMITS = {
  short: 200,
  long: 4000,
} as const;

export function participantToProfileForm(participant: {
  name: string | null;
  phoneNumber: string | null;
  telegram: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  projectIdea: string | null;
  proofOfWork: string | null;
  teamSetup: string | null;
  commitmentProof: string | null;
  jerseySize: string | null;
  ownAccommodation: string | null;
}): ProfileFormValues {
  return {
    name: participant.name?.trim() ?? "",
    phoneNumber: participant.phoneNumber?.trim() ?? "",
    telegram: participant.telegram?.trim() ?? "",
    twitterUrl: participant.twitterUrl?.trim() ?? "",
    instagramUrl: participant.instagramUrl?.trim() ?? "",
    githubUrl: participant.githubUrl?.trim() ?? "",
    linkedinUrl: participant.linkedinUrl?.trim() ?? "",
    websiteUrl: participant.websiteUrl?.trim() ?? "",
    projectIdea: participant.projectIdea?.trim() ?? "",
    proofOfWork: participant.proofOfWork?.trim() ?? "",
    teamSetup: participant.teamSetup?.trim() ?? "",
    commitmentProof: participant.commitmentProof?.trim() ?? "",
    jerseySize: participant.jerseySize?.trim() ?? "",
    ownAccommodation: participant.ownAccommodation?.trim() ?? "",
  };
}

export function sanitizeProfileInput(body: Partial<ProfileFormValues>): ProfileFormValues {
  const trim = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  return {
    name: trim(body.name, PROFILE_FIELD_LIMITS.short),
    phoneNumber: trim(body.phoneNumber, PROFILE_FIELD_LIMITS.short),
    telegram: trim(body.telegram, PROFILE_FIELD_LIMITS.short),
    twitterUrl: nullableSocialUrl("twitter", body.twitterUrl) ?? "",
    instagramUrl: nullableSocialUrl("instagram", body.instagramUrl) ?? "",
    githubUrl: nullableSocialUrl("github", body.githubUrl) ?? "",
    linkedinUrl: nullableSocialUrl("linkedin", body.linkedinUrl) ?? "",
    websiteUrl: nullableSocialUrl("website", body.websiteUrl) ?? "",
    projectIdea: trim(body.projectIdea, PROFILE_FIELD_LIMITS.long),
    proofOfWork: trim(body.proofOfWork, PROFILE_FIELD_LIMITS.long),
    teamSetup: trim(body.teamSetup, PROFILE_FIELD_LIMITS.long),
    commitmentProof: trim(body.commitmentProof, PROFILE_FIELD_LIMITS.long),
    jerseySize: trim(body.jerseySize, PROFILE_FIELD_LIMITS.short),
    ownAccommodation: trim(body.ownAccommodation, PROFILE_FIELD_LIMITS.short),
  };
}
