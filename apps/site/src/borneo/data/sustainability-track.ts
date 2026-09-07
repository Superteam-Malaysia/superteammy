/**
 * Sustainability track brief — farm-to-table / Sarawak provenance (SVB 2026).
 */

export type SustainabilityDirection = {
  n: number;
  title: string;
  body: string;
};

export const SUSTAINABILITY_TRACK_BRIEF = {
  lead:
    "How might decentralised technology build a more transparent, efficient and equitable farm-to-table ecosystem in Sarawak?",
  situation: {
    title: "The situation",
    paragraphs: [
      "Sarawak produces some of the most distinctive food in Southeast Asia, and much of it is worth real money precisely because of where it comes from.",
      "Bario rice has held Geographical Indication protection since 2009. Sarawak pepper has held GI/2015/001 since 2015 and exports several million dollars a year. Empurau, the king of the river, sells for RM800 to RM1,000 per kilogram and can reach RM2,000 depending on size and which river it came from. A single 8.2kg fish has been priced at around RM7,000. Add Sarawak coffee, wild honey, freshwater prawns, and rattan craft, and you have a set of products where origin is not a marketing story. It is the price.",
      "Which is exactly why origin gets faked.",
      "The main Bario producer makes 100 to 150 tonnes of rice a year, yet traders have been found moving more than 200 tonnes of \"Bario rice.\" More is sold than exists. Sarawak pepper competes on shelves against Vietnam-sourced \"Sarawak blends\" carrying no GI mark. Empurau raised in ponds is worth far less than wild-caught, and lookalike species such as semah and kelah sit beside it in the same markets. In every case the person who loses is the producer who did the real work, and the person who pays is the buyer who cannot tell the difference.",
      "Meanwhile producers face a second set of problems that have nothing to do with authenticity: getting paid quickly, reaching buyers directly, and planning production against demand they cannot see.",
    ],
  },
  challenge: {
    title: "The challenge",
    intro:
      "Below are six directions, ordered roughly from most tractable in five days to most ambitious. You do not need to solve all of Sarawak's agriculture. Pick one product and one problem, and go deep.",
    directions: [
      {
        n: 1,
        title: "Payments and settlement",
        body: "Many producers are rural, some are unbanked, and payment terms can stretch for weeks. How might faster, cheaper, more accessible settlement get money to the person who grew, caught or made the thing, sooner and with less taken out along the way? This includes cross-border buyers paying Sarawak producers directly.",
      },
      {
        n: 2,
        title: "Direct market access",
        body: "How might a smallholder, a fisher or a cooperative reach restaurants, exporters and consumers without four intermediaries in between? What would make a chef in Kuala Lumpur or Singapore buy direct with confidence?",
      },
      {
        n: 3,
        title: "Fair value and price transparency",
        body: "Producers often do not know what their product sells for downstream. How might visibility into the value chain shift bargaining power toward the people at the start of it?",
      },
      {
        n: 4,
        title: "Provenance for high-value goods",
        body: "Where the price gap between authentic and counterfeit is large, verification is worth paying for. Empurau is the sharpest case: wild versus farmed, and which river. Bario rice and GI-protected Sarawak pepper are close behind. How might a buyer verify what they are paying for, and how might a genuine producer prove it?",
      },
      {
        n: 5,
        title: "Export compliance",
        body: "International buyers increasingly require documented origin. The EU Deforestation Regulation now demands plot-level traceability for commodities including cocoa, coffee, palm oil, rubber and timber entering the EU. Large producers can afford compliance software. Smallholders cannot, and risk being cut out of export supply chains entirely. How might that gap be closed cheaply?",
      },
      {
        n: 6,
        title: "Production intelligence",
        body: "How might better shared data help producers anticipate demand, coordinate harvests, and reduce waste?",
      },
    ] satisfies SustainabilityDirection[],
  },
  hardPart: {
    title: "The hard part, stated plainly",
    paragraphs: [
      "At the very start of every supply chain, a human makes a claim. Someone scans a code and asserts that this sack is Bario rice, or that this fish was caught wild in the Baleh. A blockchain records that claim faithfully and permanently. It does not make the claim true.",
      "Put unverified input onchain and you have built something worse than a spreadsheet, because it looks authoritative while being just as wrong. Immutable does not mean accurate.",
      "So the interesting question is not how to store the record. It is how the first assertion earns trust. Possible answers include tying into existing certification (the Bario Rice Certification Scheme, MyIPO GI registration), cooperative or community attestation where reputation is at stake, physical tamper-evidence linked to a digital record, testing at the point of aggregation, or economic design where lying costs more than it earns.",
    ],
  },
  users: {
    title: "Where to find real users this week",
    intro:
      "You will not reach a Bario farmer in five days; the highlands are a flight away. But Kuching has plenty of the supply chain within reach, and the programme includes a day dedicated to getting in front of real users:",
    places: [
      "Wet markets and the Satok weekend market for traders and aggregators",
      "Pepper exporters and processors around Kuching",
      "Restaurants sourcing local produce, especially those serving empurau and river fish",
      "Sarawak coffee roasters and specialty retailers",
      "Farmers' cooperatives and producer associations",
      "Craft and rattan sellers along the waterfront and Main Bazaar",
    ],
    closing:
      "Talk to ten of them before you write a line of code. Ask what they lose money on, what they cannot verify, and how long they wait to get paid.",
  },
  lookingFor: {
    title: "What we are looking for",
    paragraphs: [
      "The goal is not to put agriculture on the blockchain. It is to show how decentralised technology solves a real problem for real people in a way that a conventional system could not.",
      "We would rather see one product, one clearly defined user, and a working prototype that a Sarawak producer or buyer would actually use, than a platform that covers everything and serves nobody.",
      "Two prizes of USD 500 are awarded in this track. Projects in the sustainability track also compete for the main build prizes.",
    ],
  },
} as const;
