/**
 * GetBlock Shelf Hunt — white-label shelf slots (Startup Village Borneo 2026).
 * Source: https://getblock.io/borneo/#shelf-hunt
 */

export type ShelfHuntStep = {
  n: number;
  title: string;
  duration: string;
  body: string;
};

export const SHELF_HUNT = {
  title: "Shelf Hunt",
  lead:
    "You just heard the talk. This is the part that turns it into something you can do before Friday — the offer, the afternoon assignment, and how to reach Vasily.",
  partner: "GetBlock",
  externalUrl: "https://getblock.io/borneo/#shelf-hunt",
  dayLabel: "Day 3 — Monday 7 September",
  workshop: "11:15–11:45 · Vasily · GetBlock",
  prize: {
    slots: 2,
    label: "2 open slots",
    headline: "Two slots on the shelf for Q4 2026",
    closes: "Applications close on Demo Day — both announced from the stage. Vasily is in Kuching until Friday.",
  },
  stats: [
    { value: "50 / 50", label: "Revenue share" },
    { value: "1–2 months", label: "From talk to live" },
    { value: "~115,000", label: "Developers a month" },
  ],
  weBring: [
    "Billing and payments",
    "Support and documentation",
    "Marketing and legal",
    "The audience — 115,000 a month, 92% of it arriving without us paying",
  ],
  youBring: [
    "A working product on your backend",
    "Someone who answers technical questions",
    "That is the list — we can host the backend too",
  ],
  notAFit: [
    "Heavy UI apps that need their own interface",
    "Pure crypto speculation",
    "Anything that needs a token price to go up",
  ],
  application: {
    title: "What to send",
    fields: [
      "Product — what it does, for whom, in one sentence.",
      "Backend — live URL or repo. Is it running today?",
      "Users — how many now, and how they found you.",
      "Fit — which GetBlock developer needs this.",
      "Ask — what you need from us besides distribution.",
    ],
  },
  assignment: {
    title: "The Shelf Hunt",
    intro: "Afternoon assignment — do this before you write a line of code for the shelf application.",
    steps: [
      {
        n: 1,
        title: "Find the shelves",
        duration: "30 min",
        body: "List ten companies in your space that already have a catalog, an integrations page, an app directory or a plugin store. Not investors. Platforms with paying customers and a page where other people's products are listed.",
      },
      {
        n: 2,
        title: "Find the hole",
        duration: "45 min",
        body: "Open every catalog on your list and write down what is missing. You are not looking for the biggest gap — you are looking for the one you could fill in two weeks with what you already have running.",
      },
      {
        n: 3,
        title: "Ask today",
        duration: "30 min",
        body: "One message per company. Name their gap first, your product second, and what you want third. Send it before you leave the venue — the version you send today beats the version you polish next month.",
      },
    ] satisfies ShelfHuntStep[],
  },
  caseStudy: {
    quote:
      "What this looks like when it works: our own catalog had no way to rent TRON energy. A team already had that product running. Two weeks of engineering, four weeks of legal — then $10K MRR, and they never had to find a single user.",
  },
  agentPrompt: `Help me apply for a white-label slot on GetBlock's shelf.
GetBlock is blockchain infrastructure — RPC nodes and data APIs
for roughly 115,000 developers a month. Partners put their own
product into GetBlock's console and split revenue 50/50.

Read this repository, then write a five-line application:

1. Product — what it does and for whom, in one sentence a
backend engineer would recognise. No adjectives.
2. Backend — is it live? Give the URL, or the entry point in
this repo, the runtime, and where it is hosted.
3. Users — how many today, and how they arrived. If the honest
answer is zero, write zero.
4. Fit — which GetBlock developer needs this: someone running
nodes, a compliance team, a Solana data consumer, a TRON
builder. If none of them fit, say so.
5. Ask — what we need beyond distribution: billing, hosting,
legal, or nothing.

Rules:

- Numbers or nothing. Never estimate upward.
- If the backend is not running today, say it in line 2.
That disqualifies nobody. Hiding it does.
- Under 120 words total.

Output one message, ready to paste into Telegram.`,
  contact: {
    name: "Vasily Rudomanov",
    role: "CEO, GetBlock.io / GetBlock.ai",
    tagline: "Distribution is the only moat.",
    telegram: { handle: "@cyberwider", url: "https://t.me/cyberwider" },
    email: "vasily@getblock.io",
    web: { label: "rudomanov.com", url: "https://rudomanov.com" },
    inPerson: "Kuching, until Friday",
  },
} as const;
