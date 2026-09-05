import { telegramHref } from "./types";
import type { PublicParticipant } from "./types";

function firstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[0] ?? null;
}

export function twitterHrefFromText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return firstMatch(text, /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[^\s,)\"']+/i);
}

export function linkedinHrefFromText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return firstMatch(text, /https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s,)\"']+/i);
}

export function githubHrefFromText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return firstMatch(text, /https?:\/\/(?:www\.)?github\.com\/[^\s,)\"']+/i);
}

export function instagramHrefFromText(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return firstMatch(text, /https?:\/\/(?:www\.)?instagram\.com\/[^\s,)\"']+/i);
}

export function builderSocialLinks(sources: {
  proofOfWork?: string | null;
  projectIdea?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}): {
  twitter: string | null;
  instagram: string | null;
  github: string | null;
  linkedin: string | null;
  website: string | null;
} {
  const combined = [sources.proofOfWork, sources.projectIdea].filter(Boolean).join("\n");
  return {
    twitter: sources.twitterUrl?.trim() || twitterHrefFromText(combined),
    instagram: sources.instagramUrl?.trim() || instagramHrefFromText(combined),
    github: sources.githubUrl?.trim() || githubHrefFromText(combined),
    linkedin: sources.linkedinUrl?.trim() || linkedinHrefFromText(combined),
    website: sources.websiteUrl?.trim() || null,
  };
}

export function builderConnectHref(person: PublicParticipant): string | null {
  return (
    person.twitter ??
    person.github ??
    person.linkedin ??
    person.instagram ??
    person.website ??
    telegramHref(person.telegram) ??
    null
  );
}

export function builderConnectLabel(person: PublicParticipant): string {
  if (person.twitter) return "X";
  if (person.github) return "GitHub";
  if (person.linkedin) return "LinkedIn";
  if (person.instagram) return "Instagram";
  if (person.website) return "Website";
  if (telegramHref(person.telegram)) return "Telegram";
  return "Connect";
}
