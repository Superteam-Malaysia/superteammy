export type PrizeTrack = {
  id: string;
  title: string;
  description: string;
  amount?: string;
  logo?: { src: string; alt: string };
};

import { withBasePath } from "@borneo/lib/base-path";

/**
 * Prize pool tracks — Summit-style panel copy for the homepage prizes section.
 */
export const PRIZE_TRACKS: PrizeTrack[] = [
  {
    id: "demo-day",
    title: "Demo Day",
    amount: "$6,000",
    description:
      "1st, 2nd, 3rd, and honourable mentions. Top builds pitch live — capital and judges in the room.",
  },
  {
    id: "sustainability",
    title: "Sustainability",
    amount: "2×$500",
    logo: { src: withBasePath("/partners/socoe.png"), alt: "SOCOE" },
    description:
      "Farm-to-table in Sarawak — payments, provenance, market access, and export compliance. Pick one product, go deep.",
  },
  {
    id: "content",
    title: "Content Award",
    amount: "10×$100",
    description:
      "Standout posts about Kuching and Startup Village Borneo — judged remotely after the event.",
  },
  {
    id: "race",
    title: "Amazing Race",
    amount: "2×$500",
    description:
      "Points-weighted stations across Kuching — food, culture, waterfront, and wallet onboarding.",
  },
  {
    id: "meteora",
    title: "Meteora challenge",
    amount: "1 SOL",
    description:
      "$25 deposit matched — best PnL wins by Sept 8, 8pm MYT. Register your wallet on the challenge page.",
  },
  {
    id: "redotpay",
    title: "RedotPay Card Quiz",
    amount: "Virtual cards + luggage tags",
    description:
      "All 10 card questions live — 2 minutes, one attempt per profile. Top scores win virtual cards and luggage tags.",
  },
];
