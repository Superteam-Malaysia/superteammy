import { withBasePath } from "@borneo/lib/base-path";

export const SITE = {
  name: "Startup Village Borneo",
  shortName: "SVB",
  dates: "5–9 September 2026",
  venue: "Sheraton Kuching, Sarawak",
  workshopVenue: "Voco (from Day 2)",
  anchors: ["Solana Foundation", "SOCOE"],
  rhythm:
    "Sessions start at 10:00. Hard stop 17:00–17:30. Evenings are free for building at the hotel.",
  cutoff: "Day 4 · 18:00 — Amazing Race & deck submission cutoff",
  email: "hello@superteam.my",
  telegram: "https://t.me/semi_infiknight",
  applyUrl: "https://luma.com/bpn4ndl8",
  lumaEventId: "evt-PNnLJgncbcmYquI",
  announcementTweetUrl:
    "https://x.com/SuperteamMY/status/2082421174773178540",
  beforeYouLandTweetUrl:
    "https://x.com/SuperteamMY/status/2091704403573313540",
  beforeYouLandTweetId: "2091704403573313540",
  announcementVideoSrc: withBasePath("/hero/svb-announce-9s.mp4"),
  announcementVideoPoster: withBasePath("/hero/svb-announce-poster.jpg"),
};

export const NAV_LINKS = [
  { href: "/schedule", label: "Schedule" },
  { href: "/speakers", label: "Speakers" },
  { href: "/prizes", label: "Prizes" },
  { href: "/meteora", label: "Meteora" },
  { href: "/redotpay", label: "RedotPay" },
  { href: "/amazing-race", label: "Amazing Race" },
  { href: "/teams", label: "Teams" },
] as const;

export const AUTH_LINK = { href: "/login", label: "Sign in" } as const;
