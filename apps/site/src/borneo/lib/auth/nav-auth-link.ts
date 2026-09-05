import type { Participant } from "@borneo/lib/db/schema";
import { participantInitials } from "@borneo/lib/participants/team-categories";
import { uploadPublicUrl } from "@borneo/lib/uploads/public-url";

export type NavAuthLink = {
  href: string;
  label: string;
  avatarUrl?: string | null;
  initials?: string;
};

export function navAuthLink(participant: Participant | null): NavAuthLink {
  if (!participant) {
    return { href: "/login", label: "Sign in" };
  }

  const label =
    participant.firstName?.trim() ||
    participant.name?.trim()?.split(/\s+/)[0] ||
    "Profile";

  const fullName = participant.name?.trim() || label;

  return {
    href: "/profile",
    label,
    avatarUrl: uploadPublicUrl(participant.avatarUrl),
    initials: participantInitials(fullName),
  };
}
