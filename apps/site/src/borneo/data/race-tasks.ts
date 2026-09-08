/**
 * Amazing Race task catalog — 16 milestones from the official Startup Village Borneo agenda.
 */

export type TaskCategory = "content" | "race" | "wallet";

export type TaskTheme = "content" | "food" | "culture" | "waterfront" | "wallet";

export type RaceTask = {
  id: string;
  number: number;
  title: string;
  shortDescription: string;
  details: string[];
  /** Flat points earned per unique qualifying post. */
  pointsBase: number;
  pointsMax?: number;
  pointsNote?: string;
  category: TaskCategory;
  theme: TaskTheme;
  location?: string;
  deadline?: string;
};

import { SUBMISSION_CUTOFF } from "@borneo/data/submission-cutoff";

/** @deprecated Use SUBMISSION_CUTOFF — kept for existing imports. */
export const RACE_CUTOFF = SUBMISSION_CUTOFF;

export const RACE_DEADLINE = "9 Sept 2026, 9pm MYT";

/** Milestones #1–#2 — individual X posts (Content Award). */
export const CONTENT_TASKS: RaceTask[] = [
  {
    id: "race-landed-in-kuching",
    number: 1,
    title: "Landed in Kuching",
    shortDescription:
      "Video or picture collage on X — due 9 September 9pm MYT. Tag @superteamMY, @solana, and @socoe_s.",
    details: [
      "Can be a video or a picture collage and post on X!",
      "Due by 9 September 2026, 9pm MYT.",
      "Tag @superteamMY, @solana, and @socoe_s.",
    ],
    pointsBase: 10,
    pointsNote: "10 pts",
    category: "content",
    theme: "content",
    deadline: RACE_DEADLINE,
  },
  {
    id: "content-overall-impressions",
    number: 2,
    title: "Overall impressions of Kuching and Startup Village Borneo",
    shortDescription:
      "Video or picture collage on X — due 9 September 9pm MYT. Tag @superteamMY, @solana, and @socoe_s.",
    details: [
      "Can be a video or a picture collage and post on X!",
      "Due on 9 September 2026, 9pm MYT.",
      "Tag @superteamMY, @solana, and @socoe_s.",
    ],
    pointsBase: 10,
    pointsNote: "10 pts",
    category: "content",
    theme: "content",
    deadline: RACE_DEADLINE,
  },
];

/** Milestones #3–#16 — race stations. Flat points per unique post (no bonus counting from X links). */
export const RACE_TASKS: RaceTask[] = [
  {
    id: "race-bourdain",
    number: 3,
    title: "The Bourdain pilgrimage",
    shortDescription:
      "Team photo at Choon Hui Cafe and a laksa ranking — Kuching vs West Malaysia.",
    details: [
      "Find Choon Hui Cafe and get a team photo outside. It's a morning spot so it may be shut — that's part of the game.",
      "Then hunt down a laksa you can actually eat, and rank it against a West Malaysian laksa (e.g. Johor, Penang).",
    ],
    pointsBase: 6,
    pointsNote: "6 pts per post",
    category: "race",
    theme: "food",
    location: "Choon Hui Cafe",
  },
  {
    id: "race-kek-lapis",
    number: 4,
    title: "Kek lapis at Mama Su",
    shortDescription: "Taste layered cake, film the first bite, and buy your team's favourite.",
    details: [
      "Taste a few, film the first bite, and buy your team's favourite flavour.",
    ],
    pointsBase: 4,
    pointsNote: "4 pts per post",
    category: "race",
    theme: "food",
    location: "Mama Su",
  },
  {
    id: "race-sams-ice-cream",
    number: 5,
    title: "Sam's ice cream",
    shortDescription: "Photo eating ice cream and name the flavour of the day.",
    details: [
      "Try different flavored ice cream.",
      "Take a picture eating, and tell us what's the flavor of the day.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "food",
    location: "Sam's Ice Cream",
  },
  {
    id: "race-ceylonese-naan",
    number: 6,
    title: "Ceylonese restaurant",
    shortDescription: 'Try the "Best cheese naan in town" and film your cheese pull.',
    details: [
      'Try the "Best cheese naan in town".',
      "Film your cheese pull — one qualifying post earns 4 points.",
    ],
    pointsBase: 4,
    pointsNote: "4 pts per post",
    category: "race",
    theme: "food",
    location: "Ceylonese Restaurant",
  },
  {
    id: "race-cats",
    number: 7,
    title: "Cats of Kuching",
    shortDescription: "Team photo at a Kuching cat statue — 2 points per post.",
    details: [
      "Post your team at a Kuching cat statue.",
      "One qualifying post earns 2 points — we do not count individual statues in the post.",
    ],
    pointsBase: 2,
    pointsNote: "2 pts per post",
    category: "race",
    theme: "culture",
    location: "Cat statues, Kuching",
  },
  {
    id: "race-word-sign",
    number: 8,
    title: "Kuching Word Sign",
    shortDescription: "Creative team photo at the waterfront KUCHING letter sign.",
    details: [
      "Search for the Kuching Word Sign at the Waterfront area.",
      "Take a picture in front of it in the most creative way.",
    ],
    pointsBase: 4,
    pointsNote: "4 pts per post",
    category: "race",
    theme: "waterfront",
    location: "Kuching Waterfront",
  },
  {
    id: "race-carpenter-street",
    number: 9,
    title: "Carpenter Street",
    shortDescription: "Photo with a Carpenter Street mural — 3 points per post.",
    details: [
      "Explore Carpenter Street and post a picture with a mural.",
      "One qualifying post earns 3 points — we do not count individual murals in the post.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "culture",
    location: "Carpenter Street",
  },
  {
    id: "race-sampan-ride",
    number: 10,
    title: "Waterfront sampan ride",
    shortDescription: "Film your team on a sampan ride across the Sarawak River.",
    details: [
      "Take a sampan over to the Astana or Fort Margherita side and film the ride.",
      "One qualifying post earns 8 points.",
    ],
    pointsBase: 8,
    pointsNote: "8 pts per post",
    category: "race",
    theme: "waterfront",
    location: "Kuching Waterfront",
  },
  {
    id: "race-flagpole-lean",
    number: 10,
    title: "Lean on the flagpole",
    shortDescription: "Team photo leaning on the giant waterfront flagpole.",
    details: [
      "Take a photo leaning against the giant flagpole.",
      "One qualifying post earns 2 points.",
    ],
    pointsBase: 2,
    pointsNote: "2 pts per post",
    category: "race",
    theme: "waterfront",
    location: "Kuching Waterfront",
  },
  {
    id: "race-flagpole-group",
    number: 10,
    title: "Group photo under the flagpole",
    shortDescription: "Full team grouped under the giant waterfront flagpole.",
    details: [
      "Take a group picture under the giant flagpole.",
      "One qualifying post earns 3 points.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "waterfront",
    location: "Kuching Waterfront",
  },
  {
    id: "race-darul-hana-bridge",
    number: 11,
    title: "Darul Hana bridge",
    shortDescription: "Best mid-span team photo on the golden bridge.",
    details: [
      "Cross on foot, take your best photo mid-span.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "waterfront",
    location: "Darul Hana Bridge",
  },
  {
    id: "race-old-court-house",
    number: 12,
    title: "Old Court House",
    shortDescription: "Team photo inside or outside the heritage Old Court House.",
    details: [
      "Team photo inside or outside — best shot!",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "culture",
    location: "Old Court House",
  },
  {
    id: "race-brookes-dockyard",
    number: 13,
    title: "Brooke's Dockyard Industrial Heritage Museum",
    shortDescription: "Team photo with the biggest anchor on display.",
    details: [
      "Take a picture with the biggest anchor you can find.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "culture",
    location: "Brooke's Dockyard Heritage Museum",
  },
  {
    id: "race-traditional-attire",
    number: 14,
    title: "Traditional attire",
    shortDescription: "Team photo with Sarawakian traditional attire — 5 points per post.",
    details: [
      "Post your team with Sarawakian traditional outfits from the waterfront shops.",
      "One qualifying post earns 5 points — we do not count individual outfits in the post.",
    ],
    pointsBase: 5,
    pointsNote: "5 pts per post",
    category: "race",
    theme: "culture",
    deadline: RACE_DEADLINE,
  },
  {
    id: "race-onboard-user",
    number: 15,
    title: "Onboard a real user",
    shortDescription:
      "Teach someone a blockchain product — a wallet like RedotPay — and document what was hard.",
    details: [
      "Teach someone how to use a blockchain product (a wallet like RedotPay) and document what was hard about it.",
      "Teach, don't sell. If they aren't interested, thank them and move on.",
    ],
    pointsBase: 10,
    pointsNote: "10 pts per post",
    category: "wallet",
    theme: "wallet",
  },
  {
    id: "race-photobooth",
    number: 16,
    title: "Photobooth",
    shortDescription:
      "Team photo at the Superteam MY x Solana x SOCOE photobooth at Voco — 6 Sept.",
    details: [
      "Take a picture at the Superteam MY × Solana × SOCOE photobooth at VOCO hotel on 6 Sept.",
    ],
    pointsBase: 3,
    pointsNote: "3 pts per post",
    category: "race",
    theme: "culture",
    location: "Voco Kuching",
    deadline: RACE_DEADLINE,
  },
];

/** Apply shared milestone deadline to race stations missing one. */
for (const task of RACE_TASKS) {
  if (!task.deadline) task.deadline = RACE_DEADLINE;
}

export const ALL_TASKS: RaceTask[] = [...CONTENT_TASKS, ...RACE_TASKS];

/** Exactly 18 milestones for the submit drawer — content posts first, then race stations (#10 = 3 waterfront activities). */
export const MILESTONE_SUBMIT_TASKS: RaceTask[] = [...CONTENT_TASKS, ...RACE_TASKS].sort(
  (a, b) => a.number - b.number,
);

export const THEME_LABELS: Record<TaskTheme, string> = {
  content: "Content",
  food: "Food & flavours",
  culture: "Culture & heritage",
  waterfront: "Waterfront",
  wallet: "Wallet onboarding",
};

export const THEME_ORDER: TaskTheme[] = ["food", "culture", "waterfront", "wallet"];

export const SUMMARY_THEME_ORDER: TaskTheme[] = [
  "content",
  "food",
  "culture",
  "waterfront",
  "wallet",
];

export const THEME_MAX_POINTS: Record<TaskTheme, number> = {
  content: 20,
  food: 17,
  culture: 21,
  waterfront: 20,
  wallet: 10,
};

export const THEME_METER_COLORS: Record<
  TaskTheme,
  "green" | "orange" | "purple" | "blue" | "red"
> = {
  content: "purple",
  food: "orange",
  culture: "blue",
  waterfront: "green",
  wallet: "red",
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  content: "Content",
  race: "Race",
  wallet: "Wallet",
};

/** Max race points if every station is completed once (excludes per-member content posts). */
export const MAX_RACE_POINTS = RACE_TASKS.reduce((sum, t) => sum + t.pointsBase, 0);

export function getThemePointsSummary(): { theme: TaskTheme; max: number }[] {
  return SUMMARY_THEME_ORDER.map((theme) => ({
    theme,
    max: THEME_MAX_POINTS[theme],
  }));
}

export function groupRaceTasksByTheme(): Record<TaskTheme, RaceTask[]> {
  const groups = Object.fromEntries(
    THEME_ORDER.map((theme) => [theme, [] as RaceTask[]]),
  ) as Record<TaskTheme, RaceTask[]>;

  for (const task of RACE_TASKS) {
    groups[task.theme].push(task);
  }

  return groups;
}

export const RACE_SUBMISSION_RULES = [
  "Every member can submit any milestone — as many unique X posts as you like; each post earns flat points once.",
  "No duplicate posts: the same X link cannot be used twice anywhere on the feed.",
  "Flat scoring per post — pick the correct waterfront activity milestone (sampan, flagpole lean, or flagpole group).",
  "All milestones and pitch decks due Tue 9 Sept, 9pm MYT — nothing accepted after.",
  "Teach wallet users; never pressure anyone about money or investment.",
  "Content posts must tag @superteamMY, @solana, and @socoe_s.",
  "Your build comes first — race runs in evenings and gaps.",
];
