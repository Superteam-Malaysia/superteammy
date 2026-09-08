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
  /** Base or fixed points; use pointsMax + pointsNote for variable scoring. */
  pointsBase: number;
  pointsMax?: number;
  pointsNote?: string;
  category: TaskCategory;
  theme: TaskTheme;
  location?: string;
  deadline?: string;
};

export const RACE_CUTOFF = {
  label: "Wed 10 Sept",
  time: "23:59 MYT",
  iso: "2026-09-10T23:59:59+08:00",
} as const;

export const RACE_DEADLINE = "10 Sept 2026";

/** Milestones #1–#2 — individual X posts (Content Award). */
export const CONTENT_TASKS: RaceTask[] = [
  {
    id: "race-landed-in-kuching",
    number: 1,
    title: "Landed in Kuching",
    shortDescription:
      "Video or picture collage on X — due 10 September. Tag @superteamMY, @solana, and @socoe_s.",
    details: [
      "Can be a video or a picture collage and post on X!",
      "Due by 10 September 2026.",
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
      "Video or picture collage on X — due 10 September. Tag @superteamMY, @solana, and @socoe_s.",
    details: [
      "Can be a video or a picture collage and post on X!",
      "Due on 10 September 2026.",
      "Tag @superteamMY, @solana, and @socoe_s.",
    ],
    pointsBase: 10,
    pointsNote: "10 pts",
    category: "content",
    theme: "content",
    deadline: RACE_DEADLINE,
  },
];

/** Milestones #3–#16 — race stations. */
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
    category: "race",
    theme: "food",
    location: "Sam's Ice Cream",
  },
  {
    id: "race-ceylonese-naan",
    number: 6,
    title: "Ceylonese restaurant",
    shortDescription: 'Try the "Best cheese naan in town" and film the longest cheese pull.',
    details: [
      'Try the "Best cheese naan in town".',
      "Record yourself stretching the cheese as long as possible — extra points for the longest cheese pull.",
    ],
    pointsBase: 4,
    category: "race",
    theme: "food",
    location: "Ceylonese Restaurant",
  },
  {
    id: "race-cats",
    number: 7,
    title: "Cats of Kuching",
    shortDescription: "Team photo at the iconic cat statue — more statues, more points.",
    details: [
      "Team photo at the Kuching cat statue.",
      "Bonus points for every other cat statue you find across the city.",
    ],
    pointsBase: 2,
    pointsMax: 10,
    pointsNote: "2 pts + 1 bonus per additional cat statue",
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
    category: "race",
    theme: "waterfront",
    location: "Kuching Waterfront",
  },
  {
    id: "race-carpenter-street",
    number: 9,
    title: "Carpenter Street",
    shortDescription: "Three unique murals, three photos — one point each.",
    details: [
      "Explore Carpenter Street and take a picture with 3 unique murals.",
    ],
    pointsBase: 1,
    pointsMax: 3,
    pointsNote: "3 pts — 1 per mural",
    category: "race",
    theme: "culture",
    location: "Carpenter Street",
  },
  {
    id: "race-kuching-waterfront",
    number: 10,
    title: "Kuching Waterfront",
    shortDescription: "Pick at least one waterfront activity — max 8 points from this station.",
    details: [
      "Pick at least one, and max 8 points from this station.",
      "Take a sampan over to the Astana or Fort Margherita side. Film the ride. [8 points]",
      "Take a photo \"leaning\" against the giant flagpole. [2 points]",
      "Take a group picture under the giant flagpole. [3 points]",
    ],
    pointsBase: 2,
    pointsMax: 8,
    pointsNote: "Pick at least 1 — max 8 pts from this station",
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
    category: "race",
    theme: "culture",
    location: "Brooke's Dockyard Heritage Museum",
  },
  {
    id: "race-traditional-attire",
    number: 14,
    title: "Traditional attire",
    shortDescription: "Team photo with Sarawakian traditional attire — one post, 5 points.",
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

/** Exactly 16 milestones for the submit drawer — content posts first, then race stations. */
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
  culture: 26,
  waterfront: 15,
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

/** Max race points if every task is completed at cap (excludes per-member content posts). */
export const MAX_RACE_POINTS = RACE_TASKS.reduce(
  (sum, t) => sum + (t.pointsMax ?? t.pointsBase),
  0,
);

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
  "Every member can submit any milestone — as many unique X posts as you like; each post earns points once.",
  "No duplicate posts: the same X link cannot be used twice anywhere on the feed.",
  "All milestones due 10 September 23:59 MYT — nothing accepted after.",
  "Teach wallet users; never pressure anyone about money or investment.",
  "Content posts must tag @superteamMY, @solana, and @socoe_s.",
  "Your build comes first — race runs in evenings and gaps.",
];
