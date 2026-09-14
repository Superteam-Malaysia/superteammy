/**
 * First-screen copy for team pages, taken from Demo Day slides.
 * Keep this short. Numbers, product, and who it is for. GTM and the ask live in the PDF.
 */
import type { PublicTeam } from "@borneo/lib/teams/types";

export type DemoDayPitchCopy = {
  slug: string;
  name?: string;
  tagline: string;
  description: string;
  highlights?: string[];
  category?: string;
  websiteUrl?: string;
};

export const DEMO_DAY_PITCH_COPY: DemoDayPitchCopy[] = [
  {
    slug: "fractionax",
    name: "Vori",
    tagline: "A carbon market you can actually check",
    description:
      "Carbon credits are hard to trust because the trail stops at a PDF. Vori puts the market on Solana so buyers and sellers can verify a credit end to end.\n\nBuilt by a full-stack blockchain team with a decade in tech. Scroll Open RWA track winner.",
    highlights: ["madebyvori.com", "hello@madebyvori.com"],
    category: "DeFi",
    websiteUrl: "https://www.madebyvori.com",
  },
  {
    slug: "bario-seeker",
    name: "Bario Seeker",
    tagline: "Trust begins at the source",
    description:
      "Authentic Bario Rice is easy to fake and hard to trace. Approved producers get a non-transferable Solana credential. Each batch gets a QR back to origin. Buyers land on trusted sellers, not a random listing.\n\nSpoke with more than 10 consumers, sellers, and restaurants in Sarawak.",
    highlights: ["Digital passport for verified producers", "Batch QR from farm to plate"],
    category: "Consumer",
  },
  {
    slug: "shoqi-io",
    name: "SHOQI",
    tagline: "BaZi and Feng Shui that can keep up with demand",
    description:
      "Trusted masters in Southeast Asia are overbooked and aging. SHOQI turns house and birth-chart readings into something you can actually finish: a free house reading, then a personalised plan for love, wealth, and work.\n\nBuilt with practising Feng Shui / BaZi consultants, not as a horoscope toy.",
    highlights: ["shoqi.io", "Free house reading, then a 30-day plan"],
    category: "Consumer",
    websiteUrl: "https://shoqi.io",
  },
  {
    slug: "edventures",
    name: "Edventures Wallet",
    tagline: "Digital money. Family rules.",
    description:
      "Most kids either stay locked out of digital money or get an adult wallet. Edventures is a stablecoin wallet a family uses together. Parents set who, how much, and how often. Kids save, spend, and share with real stakes.\n\nThe rails stay invisible. Lessons show up when a decision actually happens.",
    highlights: ["Parents set the rules once", "Kids learn on real allowances"],
    category: "Consumer",
    websiteUrl: "https://www.edventures.co",
  },
  {
    slug: "foresight",
    name: "hexo.fun",
    tagline: "Keep the principal. Play with the yield.",
    description:
      "Fixed deposits are boring. Lotteries eat the stake. hexo.fun lets you deposit USDC, earn about 5% interest, and use free weekly entries for daily HEXO prizes. The principal stays put.\n\nBoost tickets are optional. You are not betting the savings to play.",
    highlights: ["Live on devnet", "hexofun-beta.vercel.app"],
    category: "DeFi",
    websiteUrl: "https://hexofun-beta.vercel.app",
  },
  {
    slug: "socoe-impact",
    name: "Verita",
    tagline: "Retention that releases itself",
    description:
      "Malaysian subcontractors wait up to two years for the 5% retention a contractor holds, and often never see it. Verita puts that money in a Solana vault the contractor does not sit on.\n\nWhen the defects period ends, release runs by rule. Balances are checkable the whole time. Subs use it free. Government, GLCs, and developers pay for the mandate.",
    highlights: ["RM20k+ retention at stake per project", "54% of subs report late-payment pain"],
    category: "Infrastructure",
  },
  {
    slug: "aqua0",
    name: "Aqua0",
    tagline: "One inventory. Every pool. Every chain.",
    description:
      "Minting a stablecoin is easy. Liquidity is where issuers die: the same inventory split across Solana, Base, Unichain, USDC pairs, USDT pairs, local FX, most of it idle.\n\nAqua0 is a shared liquidity layer. Deposit once. Stay liquid across pools and chains at the same time.",
    highlights: [
      "Mainnet private beta on 7 chains",
      "50+ beta signups",
      "Shipped a Solana deposit path at SVB",
    ],
    category: "DeFi",
    websiteUrl: "https://aqua0.xyz",
  },
  {
    slug: "veya",
    name: "Veya",
    tagline: "A digital badge book for Girl Scouts",
    description:
      "Physical badge books eat hours and disappear when vests go into storage. Veya puts every badge and requirement in one app, on any device, so scouts can share progress instead of flipping paper.\n\nBuilt by two Girl Scouts who code. They are among the youngest blockchain builders in the movement.",
    highlights: ["11.2M Girl Scouts globally, 133k in Malaysia", "$2/mo after a free week"],
    category: "Consumer",
  },
  {
    slug: "solodeath",
    name: "SoloDeath",
    tagline: "A workout RPG. Optional Solana pools.",
    description:
      "SoloDeath turns showing up to train into a game: daily quests, XP, sealed gear, ranks from E to S. Live on iPhone and Android.\n\nOptional Solana pools let players put test tokens on the line. Hit S rank by the deadline or the pot goes to the people who did.",
    highlights: ["209k users on the PWA from a 5.7M-view demo", "solodeath.com"],
    category: "Gaming",
    websiteUrl: "https://solodeath.com",
  },
  {
    slug: "sea-digital-markets",
    name: "Aether",
    tagline: "Capital without borders",
    description:
      "Opportunity is global. Capital is still local. Aether is a trust-first marketplace so regional deals can meet capital that currently stops at the border.\n\nMalaysia is the launchpad. The region is how they prove trust. The world is the market.",
    highlights: ["Live web MVP on Solana devnet"],
    category: "Consumer",
  },
  {
    slug: "float-finance",
    name: "Float",
    tagline: "Working capital against money that is already coming in",
    description:
      "Late payment is a $2.5T trade-finance hole. Banks underwrite the past. Float underwrites an incoming payment: evidence of what lands next, not what already cleared.\n\nEach repayment writes an on-chain credit reputation. Pilot starting in India, one jurisdiction at a time.",
    highlights: ["25 on the waitlist", "justfloat.xyz"],
    category: "DeFi",
    websiteUrl: "https://justfloat.xyz",
  },
  {
    slug: "couch",
    name: "COUCH",
    tagline: "Post your truth on-chain",
    description:
      "Crypto pay is a black box, and anonymous posts cannot prove the author is real. COUCH is an anonymous network for crypto jobs and projects with a ZK identity layer: reputation without showing the wallet.\n\nThe long game is private, verified payroll on the same rails.",
    highlights: ["460k+ Web3 professionals in the job market", "ZK proofs, wallet stays hidden"],
    category: "Social",
  },
  {
    slug: "contentdc",
    name: "ContentDC",
    tagline: "Measure a creator's actual tech impact",
    description:
      "Independent creators cannot see whether their work moved anything, or where to collaborate next. ContentDC's Contribution Check takes an X handle and, in a few minutes, scores narrative impact in tech.\n\nThe same check is how they route collabs and paid work.",
    highlights: ["~5 minutes with an X handle", "contentdc.com"],
    category: "Consumer",
    websiteUrl: "https://contentdc.com",
  },
  {
    slug: "argo",
    name: "Argo",
    tagline: "Private thought, then a decision you can stand on",
    description:
      "Founders are drowning in tools and still have nowhere safe to think. Argo is client-side encrypted journaling with confidential AI: voice in, a daily mirror, haiku cards that are actually safe to share.\n\nLive on iOS and web. Open source. A soulbound NFT records showing up, not the contents of the journal.",
    highlights: ["Live since Aug 2026", "10 paying subscribers", "myargoquest.com"],
    category: "Consumer",
    websiteUrl: "https://myargoquest.com",
  },
  {
    slug: "tuc",
    name: "TUC Event Wallet",
    tagline: "Event leftovers, proven and paid",
    description:
      "Events throw away usable material because nobody can prove who handed what to whom. TUC weighs the handover on Solana, routes it to Sarawak makers, and pays contributors in TUC.\n\nOrganisers get a recovery trail. Makers get feedstock. The loop is the product.",
    highlights: ["July 2026 pilot: 44 people, 18kg, 8/10", "Sarawak event circuit"],
    category: "Consumer",
  },
  {
    slug: "agent-ctos",
    name: "Agent CTOS",
    tagline: "Underwriting for agents that pay strangers",
    description:
      "AI agents already settle with merchants they have never met. Agent CTOS scores those merchants from completed payments only. No KYC form. Trusted counterparties settle now. Unknowns sit in escrow and self-recover after timeout.\n\nHackathon-grade and unaudited on purpose. The loss rate is a published design choice, not a surprise.",
    highlights: ["Live on Solana devnet", "agent-ctos.vercel.app"],
    category: "Infrastructure",
    websiteUrl: "https://agent-ctos.vercel.app",
  },
  {
    slug: "webmerger",
    name: "Web#Merger",
    tagline: "Five minutes from Web2 confusion to a Solana passport",
    description:
      "Web2 people cannot find Web3 work. Solana teams cannot find contributors. Web#Merger matches an archetype, issues an SNS Builder Passport, stamps cNFT mission badges, and points at live Superteam Earn listings.\n\nThe front gate is the product. Placement fees come after someone actually walks through.",
    highlights: ["Live on Solana", "Jupiter swap referral wired", "webmerger.vercel.app"],
    category: "Consumer",
    websiteUrl: "https://webmerger.vercel.app",
  },
  {
    slug: "breeze-pocket",
    name: "BreezePocket",
    tagline: "Get paid while you wait for the price you want",
    description:
      "Solana has deep TVL and almost no consumer-shaped options yield. BreezePocket is a mobile RFQ: set the SOL price you will take, collect yield up front, stay fully collateralized.\n\nSky (exsky) previously cofounded HiggsPay and worked on YOLO Protocol.",
    highlights: ["Mobile-native at launch", "Tokenized equities planned for phase 2"],
    category: "DeFi",
  },
  {
    slug: "wintel",
    name: "Canopy",
    tagline: "Onchain agentic finance",
    description:
      "Deposit and let an agent run, or build the agent yourself. Canopy is not a chatbot with a wallet glued on. You pick the model it thinks with: theirs for free, or bring your own.\n\nTest it without a sales call.",
    highlights: ["agent.canopy.finance", "wintel.site"],
    category: "DeFi",
    websiteUrl: "https://agent.canopy.finance",
  },
  {
    slug: "lp-agent",
    name: "LP Agent",
    tagline: "Copy a smart LP. Then sleep.",
    description:
      "Most retail LPs lose money because the job is a second career. LP Agent lets you connect a wallet, pick a smart LP, and copy the position with indexer data and protection layers underneath.\n\nNimbus portfolio team. Two-plus years providing liquidity themselves.",
    highlights: ["$600k+ AUM", "$3M+ fees generated", "lpagent.io"],
    category: "DeFi",
    websiteUrl: "https://lpagent.io",
  },
  {
    slug: "soda",
    name: "SODA",
    tagline: "Solana-owned derived authority",
    description:
      "Every new chain is currently an exit from Solana. SODA makes a Solana account own a native address on other chains. The Solana program decides what may be signed. Solana verifies it before anything is broadcast.\n\nUse Aave or another chain's DeFi from a Solana wallet. No wrapped tokens. No pooled bridge. Mandates an agent cannot ignore.",
    highlights: ["Two builders", "Same primitive NEAR proved, for Solana's liquidity"],
    category: "DeFi",
  },
  {
    slug: "sugarsafe",
    name: "SugarSafe",
    tagline: "Does not tell you to give up nasi lemak",
    description:
      "One in six Malaysian adults has diabetes. Global food apps mis-read mixed plates by as much as 76%. SugarSafe: one photo, a Malaysian nutrition database checked against Ministry of Health data, one plain sentence, and a real swap.\n\nLogs land on Solana so neither the user nor the app can quietly edit history. Built by a CS student whose dad has diabetes.",
    highlights: ["Built for Malaysian food, not keto templates", "Freemium scan, paid history"],
    category: "Consumer",
  },
  {
    slug: "nextrare",
    name: "NextRare",
    tagline: "List once. Sell two ways.",
    description:
      "Collectors either sit on a fair listing for weeks or dump under market. NextRare lets the same card sit at your price and inside a gacha pack at the same time, non-custodial, Metaplex Core freeze.\n\nGacha has been live since January 2026.",
    highlights: ["$1.26M GMV", "256 paying users, 8,074 orders", "nextrare-marketplace.vercel.app"],
    category: "Consumer",
    websiteUrl: "https://nextrare-marketplace.vercel.app",
  },
  {
    slug: "rewardy-wallet",
    name: "Rewardy Wallet",
    tagline: "Earn, hold, and spend from the same wallet",
    description:
      "Points, coupons, and crypto live in different apps, then fail at the till. Rewardy is a wallet for assets and rewards, plus Rewardy Pay for local QR, plus merchant settlement on the same stack.\n\nMalaysia already scans DuitNow. They are putting stablecoin checkout on that habit, not inventing a new one.",
    highlights: ["1M+ users", "17M+ on X", "100k+ daily transfers"],
    category: "Consumer",
    websiteUrl: "https://www.rewardywallet.com",
  },
  {
    slug: "myhomecrowd",
    name: "Token Ledger",
    tagline: "One subledger for every digital asset the business touches",
    description:
      "Wallets, exchanges, custodians, and DeFi do not speak accounting. Token Ledger is a consolidated subledger: IFRS/IAS-ready reporting, Xero and QuickBooks sync, aimed at SOC 2 Type II and ISO 8000-51 data quality.\n\nBuilt by accountants for accountants. Private beta. Two tracks: Web3 startups and TradFi desks in Malaysia and Singapore.",
    highlights: ["Private beta", "Xero and QuickBooks sync"],
    category: "DeFi",
  },
  {
    slug: "mermail",
    name: "Mermail",
    tagline: "Inbox and wallet for an AI agent",
    description:
      "Agents need identity, mail, and a spend limit you can revoke. Mermail gives an agent its own inbox and wallet. You see every action. You can kill access.\n\nNimbus founding engineers. Live product, not a mock.",
    highlights: ["8,588 emails sent in 25 days", "984 users", "mermail.app"],
    category: "Infrastructure",
    websiteUrl: "https://mermail.app",
  },
  {
    slug: "oneplan",
    name: "OnePlan Travel",
    tagline: "One shared fund for the group trip",
    description:
      "Group trips die on two things: whose plan, and who paid. Paste TikTok or Instagram links into an itinerary. Everyone deposits into a Trip Fund. Pay merchants by QR from that fund. Settle in one click.\n\nStablecoin or fiat in. The group stops being the bank.",
    highlights: ["824 users, 574 trips", "7% trial-to-paid"],
    category: "Consumer",
    websiteUrl: "https://www.oneplan.space",
  },
  {
    slug: "loofta-pay",
    name: "Loofta Pay",
    tagline: "Send money like a message",
    description:
      "Creators and freelancers lose about 6% and about three days on a cross-border payout. Loofta is fiat in, stablecoins on Solana in under a second (Magicblock private rollups), claim in 150+ tokens or NGN, EUR, USD.\n\nSend to a handle or an email. 0.1% on private txs.",
    highlights: ["2,500+ mainnet users", "$15k+ payments", "pay.loofta.xyz"],
    category: "Consumer",
    websiteUrl: "https://pay.loofta.xyz",
  },
  {
    slug: "kurtosis-ratings",
    name: "Kurtosis Ratings",
    tagline: "Fixed-income diligence that does not stop at the token ticker",
    description:
      "Two positions can share a token and have completely different risk. Kurtosis maps layer-by-layer attribution for PT positions, wrappers, and the yield source underneath, then watches them 24/7.\n\nFor funds that need to underwrite Solana fixed income like they underwrite anything else.",
    highlights: ["Colosseum Singapore 2nd runner-up", "$800k proprietary data / monitoring"],
    category: "DeFi",
  },
  {
    slug: "vello",
    name: "Vello",
    tagline: "Turn long-form into the first 1,000 signups",
    description:
      "Most clipping is still a human on a timeline. Vello runs agent clippers that cut, post, and settle UGC for a fraction of an agency. Marketplace for campaigns, builder for agents, x402 for payouts.\n\nSame spend, clients saw about 300% more views than Meta in their tests.",
    highlights: ["7,040 organic users", "Top 15 App Store Business in Malaysia"],
    category: "Consumer",
    websiteUrl: "https://velloagents.com",
  },
  {
    slug: "dgen",
    name: "DGEN",
    tagline: "Card and wallet for people who already live in crypto",
    description:
      "DGEN is a privacy-leaning card (Visa/Mastercard, USDT/USDC/USD, high limits, offshore KYC) plus a wallet that swaps across 3,500+ assets and 300 chains, Lightning included.\n\nCole Goodwin previously ran operations at Coinos, putting crypto payments into 1,000+ businesses across 18 countries.",
    highlights: ["dgentech.io", "cole@dgentech.io"],
    category: "DeFi",
    websiteUrl: "https://dgentech.io",
  },
];

export function pitchCopyForSlug(slug: string): DemoDayPitchCopy | null {
  return DEMO_DAY_PITCH_COPY.find((entry) => entry.slug === slug) ?? null;
}

/** Public team page: Demo Day brief wins over stale seed copy. */
export function teamPageCopy(team: PublicTeam) {
  const pitch = pitchCopyForSlug(team.slug);
  return {
    name: pitch?.name ?? team.name,
    tagline: pitch?.tagline ?? team.tagline,
    description: pitch?.description ?? team.description,
    category: pitch?.category ?? team.category ?? "Other",
    websiteUrl: pitch?.websiteUrl ?? team.websiteUrl ?? team.proofUrl,
    highlights: pitch?.highlights ?? [],
  };
}
