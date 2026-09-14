/**
 * Team directory copy extracted from Demo Day pitch decks (Canva master deck DAHUnP-gC2s).
 * Source: get-design-content per page range in demo-day-decks.ts.
 */
export type DemoDayPitchCopy = {
  slug: string;
  name?: string;
  tagline: string;
  description: string;
  category?: string;
  websiteUrl?: string;
};

export const DEMO_DAY_PITCH_COPY: DemoDayPitchCopy[] = [
  {
    slug: "fractionax",
    name: "Vori",
    tagline: "The transparent carbon market you can trust",
    description:
      "Vori builds a transparent carbon market on Solana — making credits verifiable end-to-end for buyers and sellers. Founded by a full-stack blockchain builder with a decade in tech; first place in the Scroll Open RWA track and mentor to IEEE Innovation Nation winning teams. Contact: hello@madebyvori.com · madebyvori.com",
    category: "DeFi",
    websiteUrl: "https://www.madebyvori.com",
  },
  {
    slug: "bario-seeker",
    tagline: "Trust begins at the source",
    description:
      "Bario Digital Passport and Marketplace gives approved Bario Rice producers a non-transferable Solana credential, links each batch to verified origin via QR, and connects consumers to trusted sellers. Spoke with 10+ consumers, sellers, and restaurants in Sarawak. Revenue: 3% marketplace commission, ~RM100/mo seller tools, and batch verification services. Seeking $400k for 10% equity.",
    category: "Consumer",
  },
  {
    slug: "shoqi-io",
    name: "SHOQI (首旗)",
    tagline: "Automated BaZi and Feng Shui guidance at scale",
    description:
      "SHOQI addresses Southeast Asia's ~$1.2B annual Feng Shui demand where trusted masters are overbooked. Lead magnet: free house Feng Shui reading via BaZi; upsell: personalised automated guidance for love, wealth, and success within 30 days. Client testimonials from Web3 and startup leaders including YellowPanther and Chasm co-founder John Koh.",
    category: "Consumer",
  },
  {
    slug: "foresight",
    name: "hexo.fun",
    tagline: "Savings that pays stable yield with daily prize draws",
    description:
      "Deposit USDC, earn ~5% interest, and play free weekly entries for daily HEXO prizes — principal guaranteed. Bridges boring fixed deposits (~0–3%) and losing lotteries ($384B/year globally): your USDC stays untouched while you boost odds with optional tickets. Revenue from boost rake, surplus vault yield, and staking yield tax. Live on devnet — hexofun-beta.vercel.app.",
    category: "DeFi",
    websiteUrl: "https://hexofun-beta.vercel.app",
  },
  {
    slug: "socoe-impact",
    name: "Verita",
    tagline: "Retention that releases itself — no contractor, no delay",
    description:
      "Malaysian subcontractors wait up to two years for the 5% retention contractors hold back — and often never see it. Verita puts retention in a program-owned Solana vault: release by rule when the defects period ends, time-boxed defect claims, and verifiable balances anytime. Subcontractors use it free; government, GLCs, and developers pay for mandates. Field evidence: RM20k+ retention at stake per project, 54% of subs report late-payment pain.",
    category: "Infrastructure",
  },
  {
    slug: "veya",
    tagline: "Digital badge book for Girl Scouts",
    description:
      "Girl Scouts spend hours flipping physical badge books and lose access when vests get stored between levels. Veya lets scouts scroll all badges and requirements in one app, keep badges on any device, and share progress worldwide. 11.2M Girl Scouts globally · 133k in Malaysia. Waitlist with $1 early access, then $2/mo after a free week. Built by two Girl Scouts who code — youngest blockchain builders in the movement.",
    category: "Consumer",
  },
  {
    slug: "solodeath",
    tagline: "The workout RPG with optional Solana reward pools",
    description:
      "SoloDeath turns fitness consistency into a game: daily quests, XP, sealed gear chests, and ranks from E to S. Live on iOS and Android; optional Solana pools let players stake test tokens — reach S rank by deadline or forfeit to winners. 209k users on PWA MVP from a 5.7M-view demo video. $4.99 one-time after 7-day free trial. Next: devnet escrow and iPhone wallet signing.",
    category: "Gaming",
    websiteUrl: "https://solodeath.com",
  },
  {
    slug: "float-finance",
    tagline: "Credit reputation on chain for businesses",
    description:
      "Late payment drives a $2.5T trade finance gap. Float underwrites incoming payments — credit history is past evidence; an incoming payment is evidence of your future. Working capital now, on-chain credit reputation with every repayment. Pilot beginning with 25 on waitlist; revenue from financing charges on short-term credit advanced. Starting India, one jurisdiction at a time. justfloat.xyz",
    category: "DeFi",
    websiteUrl: "https://justfloat.xyz",
  },
  {
    slug: "couch",
    tagline: "Post your truth on-chain",
    description:
      "Crypto compensation is a black box — anonymous voices can't prove they're real. COUCH is an anonymous social network for crypto jobs and projects with a ZK identity layer: verified reputation without revealing wallets. Paid-to treasury proofs, aggregated salary dataset/API, and expansion into private verified payroll. 460k+ Web3 professionals; seeding through Superteam network and crypto communities.",
    category: "Social",
  },
  {
    slug: "konrad-gnat",
    name: "Argo",
    tagline: "The private foundry where raw thoughts become clear decisions",
    description:
      "Founders don't lack tools — they lack headspace. Argo is client-side encrypted journaling with confidential AI: voice entry, daily mirror advice, and haiku cards safe to share. Live on iOS and web since Aug 2026; open source. Soulbound Soul NFT records consistency; Argo Pro $19.99/mo for workshops and community. 517 hours YouTube, 100 events, 10 paying subscribers. Shipping Sign-In with Solana as wallet-derived encryption key.",
    category: "Consumer",
    websiteUrl: "https://myargoquest.com",
  },
  {
    slug: "tuc",
    name: "TUC Event Wallet",
    tagline: "Recover, verify, and upcycle event materials",
    description:
      "Every event ends with usable materials discarded, unconnected, and unverified. TUC Event Wallet (TUCEW) collects event materials, weighs and verifies handover on Solana, routes to Sarawak community makers for upcycled products, and rewards contributors with TUC tokens. July 2026 pilot: 44 participants, 18kg collected, 8/10 rating. B2B recovery fees from event organisers plus ESG gift sales.",
    category: "Consumer",
  },
  {
    slug: "agent-ctos",
    tagline: "On-chain underwriting for agents that pay strangers",
    description:
      "69,000 AI agents already settle payments on x402; agent commerce projected at $300–500B US by 2030. Agent CTOS scores merchants solely from completed payments — no KYC. Trusted merchants settle instantly; unknowns go to escrow with self-recovery after timeout. Solana-native gap: no commerce escrow spec on x402 today. Live on devnet — agent-ctos.vercel.app.",
    category: "Infrastructure",
    websiteUrl: "https://agent-ctos.vercel.app",
  },
  {
    slug: "webmerger",
    name: "Web#Merger",
    tagline: "The front gate to Web3",
    description:
      "Web2 talent can't find Web3 work; Solana projects can't find contributors. Web#Merger gets a confused Web2 user to verified Solana contributor in five minutes: AI archetype matching, SNS Builder Passport, cNFT mission badges, and live Superteam Earn matches. Live on devnet with Jupiter referral integration. Revenue: protocol referral fees, talent matching (10–15% first-year comp), and verification API subscriptions.",
    category: "Consumer",
    websiteUrl: "https://webmerger.vercel.app",
  },
  {
    slug: "breeze-pocket",
    name: "BreezePocket",
    tagline: "Get paid while waiting for the crypto price you want",
    description:
      "Solana has $35B TVL and 15M+ Phantom wallets but almost no consumer-grade on-chain options yield. BreezePocket brings Rysk-style fixed-price yield to Solana: set your SOL price, receive yield upfront, fully collateralized. Mobile-native RFQ at launch; tokenized equities in phase 2. Target: $100k TVL and 100 wallets at MVP, scaling via Phantom and Jupiter distribution.",
    category: "DeFi",
  },
  {
    slug: "lp-agent",
    tagline: "Liquidity management made simple",
    description:
      "LP Agent helps new and pro LPs earn on memecoins, stocks-on-chain, and high-volume Solana markets. $600k+ AUM, $3M+ fees generated, real-time indexer, and protection layers so passive LPs can copy smart wallets. Founded by Nimbus portfolio team with 2+ years LP experience. Connect wallet, choose a smart LP, copy, sleep. lpagent.io",
    category: "DeFi",
    websiteUrl: "https://lpagent.io",
  },
  {
    slug: "sugarsafe",
    tagline: "Doesn't tell you to give up nasi lemak — shows you how to keep eating it",
    description:
      "1 in 6 Malaysian adults has diabetes; mainstream food apps miscalculate mixed Asian dishes by up to 76%. SugarSafe: one photo → Malaysian nutrition database cross-checked with Ministry of Health data → one plain sentence and a real swap. Tamper-proof logs on Solana. Freemium with clinic partnerships and long-term verified-management insurance. Built solo by a CS student whose dad has diabetes.",
    category: "Consumer",
  },
  {
    slug: "nextrare",
    tagline: "List once. Sell two ways.",
    description:
      "Trading card collectors list at fair price and wait weeks — or sell under market. NextRare marketplace: buyable at your price and inside a gacha pack simultaneously; non-custodial Metaplex Core freeze. Gacha live since Jan 2026: $1.26M GMV, 256 paying users, 8,074 orders. 2% on direct buys; 15% gap on cash-outs split 50/50 with sellers. Raising $1M at $10M post. nextrare-marketplace.vercel.app",
    category: "Consumer",
    websiteUrl: "https://nextrare-marketplace.vercel.app",
  },
  {
    slug: "myhomecrowd",
    name: "Token Ledger",
    tagline: "One financial data and accounting layer for every digital asset your business touches",
    description:
      "Wallets, exchanges, custodians, and DeFi in one consolidated subledger — SOC 2 Type II, ISO 8000-51 data quality, IFRS/IAS audit-ready reporting, synced to Xero and QuickBooks. Tokenised assets projected to reach $18.9T by 2033; stablecoins settle $1.8T/month. Two-track GTM: Web3 startups and TradFi institutions in Malaysia & Singapore. Private beta — token-ledger demo on Vercel.",
    category: "DeFi",
    websiteUrl: "https://token-ledger-heroch94-3036s-projects.vercel.app",
  },
  {
    slug: "mermail",
    tagline: "Inbox and wallet for your AI agent",
    description:
      "Agents need identity, communication, and controlled payments. Mermail gives AI agents their own email inbox and wallet with spending limits you set — track every action, revoke anytime. 25 days since launch: 8,588 emails sent, 984 users, 93 agent wallet users. Revenue: subscriptions, AI quota credits, and usage-based MPP pricing. Built by Nimbus founding engineers. mermail.app",
    category: "Infrastructure",
    websiteUrl: "https://mermail.app",
  },
  {
    slug: "oneplan",
    name: "OnePlan Travel",
    tagline: "Group travel on one shared fund",
    description:
      "Group trips break on planning chaos and who-pays-who. OnePlan: paste TikTok/IG links to build itineraries, deposit into a shared Trip Fund (stablecoin or fiat), pay merchants by QR from the fund, settle in one click. 824 users, 574 trips, 7% trial-to-subscription. Revenue: Pro subscription, video scan credits, 1% transaction fee. Targeting Gen Z travel inspiration on TikTok (64% use it as a search engine).",
    category: "Consumer",
  },
  {
    slug: "loofta-pay",
    tagline: "Send money like a message — simple, private, global",
    description:
      "Creators and freelancers lose ~6% and ~3 days on cross-border payments; 56% have experienced late payments. Loofta Pay: fiat-in/fiat-out with stablecoins settling on Solana in under a second via Magicblock private ephemeral rollups. Send $ to a handle or email; claim in 150+ tokens or NGN/EUR/USD. 2,500+ mainnet users, $15k+ payments, 0.1% fee on private txs. pay.loofta.xyz",
    category: "Consumer",
    websiteUrl: "https://pay.loofta.xyz",
  },
  {
    slug: "kurtosis-ratings",
    name: "Kurtosis Ratings",
    tagline: "Systematic fixed-income infrastructure for institutions, on-chain",
    description:
      "Institutions struggle with expensive pre-investment diligence and manual post-approval operations on fixed-income positions. Kurtosis Russian-Doll Ratings map layer-by-layer risk attribution, 24/7 monitoring, and allocation infrastructure for PT positions, token wrappers, and underlying yield sources. Colosseum Singapore 2nd runner-up; $800k non-dilutive TVL commitment; raising angel SAFE at $400k.",
    category: "DeFi",
  },
  {
    slug: "vello",
    tagline: "Turn long-form into your first 1,000 signups",
    description:
      "80% of the $40B clipping industry is still manual. Vello orchestrates AI agent clippers that create, distribute, and verify UGC at 10× lower cost than agencies — campaigns marketplace, agent builder, and x402 payouts. 7,040 organic users, top 15 App Store Business category in Malaysia, $20k paid out by 2026. Clients see 300% more views vs Meta on same spend. Raising $1M seed.",
    category: "Consumer",
  },
  {
    slug: "dgen",
    name: "DGEN",
    tagline: "Fintech for a new generation — privacy-focused crypto card and wallet",
    description:
      "DGEN Visa/Mastercard: industry-leading limits ($50k/txn, $250k daily, $1M monthly), offshore KYC, multi-currency USDT/USDC/USD balance, email crypto transfers. DGEN Wallet: swap 3,500+ coins across 300 chains, Lightning Network, private sidechain masking amounts. Public company path (CSE listing anticipated). Revenue: 2% load fee, white-label licensing, referral tiers, treasury management.",
    category: "DeFi",
    websiteUrl: "https://dgentech.io",
  },
];

export function pitchCopyForSlug(slug: string): DemoDayPitchCopy | null {
  return DEMO_DAY_PITCH_COPY.find((entry) => entry.slug === slug) ?? null;
}
