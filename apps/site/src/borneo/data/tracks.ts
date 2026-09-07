/**
 * Program tracks — sustainability and content awards (official agenda).
 */

import { SUSTAINABILITY_TRACK_BRIEF } from "@borneo/data/sustainability-track";

export const SUSTAINABILITY_TRACK = {
  title: "Sustainability track",
  prizes: { count: 2, amount: "$500" },
  total: "$1,000",
  partner: "SOCOE",
  announcedOn: "Day 2 — Sunday 6 September",
  summary: SUSTAINABILITY_TRACK_BRIEF.lead,
  criteria: [
    "One product, one clearly defined user — go deep, not wide.",
    "A real Sarawak producer or buyer problem (payments, provenance, market access, compliance, or similar).",
    "Working prototype someone in the supply chain would actually use this week.",
    "Honest about how the first onchain claim earns trust — immutable ≠ accurate.",
    "Two teams receive $500 each on Demo Day; track projects also compete for main build prizes.",
  ],
  timeline: [
    { when: "Day 2", what: "Track brief and challenge directions published" },
    { when: "Day 3", what: "Get in front of real users — markets, restaurants, exporters, cooperatives" },
    { when: "Day 2–4", what: "Build with one product and one problem in focus" },
    { when: "Day 5", what: "Demo Day judging includes sustainability track" },
  ],
};

export const CONTENT_AWARD = {
  title: "Content Award",
  prizes: { count: 10, amount: "$100" },
  total: "$1,000",
  judged: "Remotely within 24 hours after the event",
  summary:
    "Ten $100 prizes for standout content about Kuching and Startup Village Borneo — judged after Demo Day.",
  tags: ["@superteamMY", "@solana", "@socoe_s"],
  tasks: [
    {
      id: "first-impressions",
      title: "First impressions of Kuching",
      deadline: "6 September 2026",
      points: "10 pts per qualifying team member post (race)",
      format: "Video or picture collage on X",
    },
    {
      id: "overall-impressions",
      title: "Overall impressions of SVB",
      deadline: "10 September 2026",
      points: "Content Award — no race points",
      format: "Video or collage reflecting the full week",
    },
  ],
  rules: [
    "Tag @superteamMY, @solana, and @socoe_s on every post.",
    "Final impressions due 10 September — judged remotely after the event.",
    "Quality and authenticity beat production polish.",
  ],
};
