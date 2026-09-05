export type SocialLinkField = "twitter" | "github" | "linkedin" | "instagram" | "website";

const MAX_LEN = 500;

function stripAt(value: string): string {
  return value.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

/** Normalize handle or URL into a full https link for storage. */
export function normalizeSocialUrl(field: SocialLinkField, raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim().slice(0, MAX_LEN);
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = stripAt(trimmed);
  if (!handle) return "";

  switch (field) {
    case "twitter":
      return `https://x.com/${handle}`;
    case "github":
      return handle.includes("/") ? `https://github.com/${handle}` : `https://github.com/${handle}`;
    case "linkedin":
      return handle.includes("linkedin.com")
        ? `https://${handle.replace(/^https?:\/\//i, "")}`
        : `https://www.linkedin.com/in/${handle}`;
    case "instagram":
      return handle.includes("instagram.com")
        ? `https://${handle.replace(/^https?:\/\//i, "")}`
        : `https://www.instagram.com/${handle}`;
    case "website":
      return `https://${handle.replace(/^\/+/, "")}`;
    default:
      return trimmed;
  }
}

export function nullableSocialUrl(field: SocialLinkField, raw: unknown): string | null {
  const normalized = normalizeSocialUrl(field, raw);
  return normalized || null;
}
