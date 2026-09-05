import type { FaqItem } from "@borneo/types/event";

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what",
    category: "general",
    question: "What is Startup Village Borneo?",
    answer:
      "A five-day Solana-first hackathon and builder village in Kuching, Sarawak (5–9 September 2026). Workshops by day, building at the hotel by night, an Amazing Race across Kuching, and Demo Day on the final morning.",
  },
  {
    id: "where",
    category: "general",
    question: "Where is the event?",
    answer:
      "Sheraton Kuching (downtown waterfront) is your hotel — check-in from 15:00, welcome dinner Day 1, evening building, and breakfast each morning. Workshop days (Day 2–5): breakfast at Sheraton, then the 09:30 bus to voco Kuching (near the airport) for 10:00 sessions. Day 5: check out of Sheraton, then bus to Voco for Demo Day. All times are Malaysia Time (UTC+8).",
  },
  {
    id: "teams",
    category: "teams",
    question: "How does team formation work?",
    answer:
      "Teams are assigned before arrival and placed in WhatsApp groups so the race starts on landing. Formation opens at the Day 1 welcome dinner and closes at Day 2 lunch. Solo founders are welcome — we help matchmake.",
  },
  {
    id: "cutoff",
    category: "submissions",
    question: "What is the submission cutoff?",
    answer:
      "Day 4 (Tuesday 8 September) at 18:00 sharp. Amazing Race threads and pitch decks must be submitted before this time. The system will reject anything late — plan accordingly.",
  },
  {
    id: "race-submit",
    category: "race",
    question: "How do we submit Amazing Race tasks?",
    answer:
      "Post a team Twitter thread tagging all members. Content tasks are individual X posts (each member earns 10 pts for the team). See the Amazing Race page for every station and point value.",
  },
  {
    id: "wallet-task",
    category: "wallet",
    question: "What counts for the wallet onboarding task?",
    answer:
      "Teach someone to use a real crypto product — a wallet like Jupiter or RedotPay, or Sanctum. Document what was confusing. Teach, don't sell. Never pressure anyone about money or investment.",
  },
  {
    id: "content-award",
    category: "race",
    question: "What is the Content Award?",
    answer:
      "Post your overall impressions of Kuching and SVB on X by 10 September (no race points). Ten content prizes of $100 each are judged remotely after the event.",
  },
  {
    id: "sustainability",
    category: "general",
    question: "What is the sustainability track?",
    answer:
      "SOCOE-aligned criteria announced on Day 2 so teams can opt in early. Two $500 prizes — don't retrofit on Day 4.",
  },
  {
    id: "prizes",
    category: "general",
    question: "How are prizes paid?",
    answer:
      "USD $10,000 total prize pool across demo day placements, honourable mentions, sustainability, content, and Amazing Race. Winners are paid per event operations after the village.",
  },
  {
    id: "evenings",
    category: "general",
    question: "What happens in the evenings?",
    answer:
      "Sessions hard-stop by 17:30. Evenings are free for building at the hotel. The Amazing Race runs in gaps — your product build comes first. Waterfront race stations are a five-minute walk from Sheraton — plan evenings, not workshop hours.",
  },
  {
    id: "mdac",
    category: "travel",
    question: "Do I need a digital arrival card for Sarawak?",
    answer:
      "Most foreign visitors must complete the Malaysia Digital Arrival Card (MDAC) before landing — including flights into Kuching (KCH). Submit it free at imigresen-online.imi.gov.my/mdac/main within 3 days of your arrival date and keep the confirmation handy for immigration. Singapore citizens and Malaysian permanent residents are exempt. The old EnterSarawak app is no longer required.",
  },
  {
    id: "visa",
    category: "travel",
    question: "Do I need a visa to enter Malaysia?",
    answer:
      "Check entry requirements for your passport before booking. Many nationalities get visa-free or e-visa access to Malaysia. MDAC is separate from visa — you may need both. When in doubt, confirm with your nearest Malaysian embassy or consulate.",
  },
  {
    id: "kch-sheraton",
    category: "travel",
    question: "How do I get from KCH to Sheraton?",
    answer:
      "Fly into Kuching International Airport (KCH) — one terminal for domestic and international flights. Sheraton is ~11 km north (~15 min in light traffic). Download Grab before you land and pin KCH for pickup outside arrivals; airport taxis also run from the official counter. voco (workshop venue) is only ~5 min from the airport if you need it first. Save Sheraton Kuching as a favourite before Day 1.",
  },
  {
    id: "sheraton-voco",
    category: "travel",
    question: "How do I get between Sheraton and Voco?",
    answer:
      "Workshop days (Day 2–5): breakfast at Sheraton before 09:00, meet in the lobby, then the 09:30 organizer bus to voco Kuching (~15–20 min) for a 10:00 start. After sessions wrap (~17:30), return to Sheraton for evening building. Grab works too — pin both hotels and use GrabCar (not GrabShare) when travelling with teammates or demo gear.",
  },
  {
    id: "grab",
    category: "travel",
    question: "How do I get around Kuching?",
    answer:
      "Grab is the default — download the app before you land. It's reliable across Kuching and cheaper than hailing taxis. Pay with card or GrabPay. Amazing Race tasks spread across the city; the waterfront loop near Sheraton is walkable.",
  },
  {
    id: "money-sim",
    category: "travel",
    question: "What about money, SIMs, and ops?",
    answer:
      "Malaysian Ringgit (MYR) — ATMs and cards work widely. Celcom, Digi, and Maxis counters in KCH arrivals sell local SIMs and eSIMs. Join your team WhatsApp group before leaving the airport; SVB ops (shuttles, race brief, mentor hours) run on WhatsApp, not email.",
  },
  {
    id: "travel-whatsapp",
    category: "travel",
    question: "What should I do when I land on Day 1?",
    answer:
      "Check in at Sheraton, join your team WhatsApp group, and the Amazing Race starts immediately — the race brief drops on arrival. All teams back by 18:00; welcome dinner at the Sheraton Rooftop Bar with RedotsClub at 18:30.",
  },
];

/** FAQ ids surfaced on the homepage “Before you land” preview. */
export const BEFORE_YOU_LAND_FAQ_IDS = [
  "what",
  "where",
  "teams",
  "mdac",
  "kch-sheraton",
  "sheraton-voco",
  "grab",
  "money-sim",
] as const;

export function faqById(id: string): FaqItem | undefined {
  return FAQ_ITEMS.find((item) => item.id === id);
}
