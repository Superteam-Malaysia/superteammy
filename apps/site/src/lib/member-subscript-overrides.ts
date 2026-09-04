import type { Profile } from "./types";

function normalizeNick(profile: Profile): string {
  return (profile.nickname || profile.real_name || "").toLowerCase();
}

function twitterHandle(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/?#]+)/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function withRole(profile: Profile, roleName: string): Profile {
  const roles = profile.roles ?? [];
  if (roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase())) {
    return profile;
  }

  return {
    ...profile,
    roles: [{ id: `display-${roleName.toLowerCase()}`, name: roleName }, ...roles],
  };
}

/** Card subscripts for members missing role labels in Supabase. */
export function applyMemberSubscriptOverrides(profiles: Profile[]): Profile[] {
  return profiles.map((profile) => {
    const nick = normalizeNick(profile);
    const handle = twitterHandle(profile.twitter_url);

    if (nick.includes("nikki") || handle === "nikkideyy") {
      return withRole(profile, "Content");
    }

    if (
      profile.member_number === 22 ||
      nick.includes("semi") ||
      handle.includes("semi")
    ) {
      return withRole(profile, "DevRel");
    }

    return profile;
  });
}
