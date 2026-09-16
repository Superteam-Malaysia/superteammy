import type { Metadata } from "next";

const SITE_NAME = "Startup Village Borneo";
const DEFAULT_DESCRIPTION =
  "Solana-first hackathon in Kuching, Sarawak — 5–9 September 2026. Schedule, Amazing Race, prizes, and the full builder experience.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://my.superteam.fun/borneo";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/borneo";

/** Absolute site path under the Borneo base (e.g. `/teams/argo` → `/borneo/teams/argo`). */
export function borneoPath(path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!normalized || normalized === "/") return BASE_PATH || "/";
  return `${BASE_PATH}${normalized}`;
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
}: {
  title: string;
  description?: string;
  path?: string;
  /** Absolute path or full URL for OG/Twitter card image. */
  image?: string | null;
}): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  const siteRoot = SITE_URL.replace(/\/$/, "");
  const resolvedPath = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";
  // Avoid /borneo/borneo when SITE_URL already ends with the base path.
  const url = resolvedPath
    ? siteRoot.endsWith(BASE_PATH) && resolvedPath.startsWith(`${BASE_PATH}/`)
      ? `${siteRoot}${resolvedPath.slice(BASE_PATH.length)}`
      : `${siteRoot}${resolvedPath}`
    : SITE_URL;
  const images = image ? [{ url: image, alt: title }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_MY",
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL.replace(/\/borneo\/?$/, "") || SITE_URL),
  title: {
    default: `${SITE_NAME} 2026`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Startup Village Borneo",
    "SVB",
    "Solana",
    "hackathon",
    "Kuching",
    "Sarawak",
    "Amazing Race",
    "Superteam Malaysia",
  ],
  // STMY mark — shared favicon with my.superteam.fun root (app/ + public/ icons)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${SITE_NAME} 2026`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_MY",
    type: "website",
    images: [{ url: "/borneo/brand/svb-logo.png", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} 2026`,
    description: DEFAULT_DESCRIPTION,
    images: ["/borneo/brand/svb-logo.png"],
  },
};
