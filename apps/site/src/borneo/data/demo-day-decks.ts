/** Master Demo Day deck — Startup Village Borneo, Sept 9 2026 */
export const DEMO_DAY_MASTER_DESIGN_ID = "DAHUnP-gC2s";

export const DEMO_DAY_MASTER_VIEW_URL = `https://www.canva.com/design/${DEMO_DAY_MASTER_DESIGN_ID}/view`;

export type DemoDayDeckMapping = {
  slug: string;
  pageStart: number;
  pageEnd: number;
  pitchTitle: string;
};

/** Pitch deck page ranges inside the merged master Canva deck (verified via Canva content API). */
export const DEMO_DAY_DECK_MAPPINGS: DemoDayDeckMapping[] = [
  { slug: "fractionax", pageStart: 20, pageEnd: 22, pitchTitle: "Vori" },
  { slug: "bario-seeker", pageStart: 23, pageEnd: 32, pitchTitle: "Bario Seeker" },
  { slug: "shoqi-io", pageStart: 33, pageEnd: 38, pitchTitle: "SHOQI" },
  { slug: "foresight", pageStart: 39, pageEnd: 51, pitchTitle: "hexo.fun" },
  { slug: "socoe-impact", pageStart: 52, pageEnd: 71, pitchTitle: "Verita" },
  { slug: "veya", pageStart: 72, pageEnd: 77, pitchTitle: "Veya" },
  { slug: "solodeath", pageStart: 103, pageEnd: 111, pitchTitle: "SoloDeath" },
  { slug: "float-finance", pageStart: 112, pageEnd: 115, pitchTitle: "Float Finance" },
  { slug: "couch", pageStart: 116, pageEnd: 127, pitchTitle: "COUCH" },
  { slug: "konrad-gnat", pageStart: 128, pageEnd: 139, pitchTitle: "Argo" },
  { slug: "tuc", pageStart: 140, pageEnd: 163, pitchTitle: "TUC Event Wallet" },
  { slug: "agent-ctos", pageStart: 164, pageEnd: 179, pitchTitle: "Agent CTOS" },
  { slug: "webmerger", pageStart: 180, pageEnd: 186, pitchTitle: "Web#Merger" },
  { slug: "breeze-pocket", pageStart: 187, pageEnd: 216, pitchTitle: "BreezePocket" },
  { slug: "lp-agent", pageStart: 217, pageEnd: 259, pitchTitle: "LP Agent" },
  { slug: "sugarsafe", pageStart: 260, pageEnd: 279, pitchTitle: "SugarSafe" },
  { slug: "nextrare", pageStart: 280, pageEnd: 294, pitchTitle: "NextRare" },
  { slug: "myhomecrowd", pageStart: 295, pageEnd: 318, pitchTitle: "Token Ledger" },
  { slug: "mermail", pageStart: 319, pageEnd: 330, pitchTitle: "Mermail" },
  { slug: "oneplan", pageStart: 331, pageEnd: 355, pitchTitle: "OnePlan Travel" },
  { slug: "loofta-pay", pageStart: 356, pageEnd: 375, pitchTitle: "Loofta Pay" },
  { slug: "kurtosis-ratings", pageStart: 376, pageEnd: 385, pitchTitle: "Kurtosis Ratings" },
  { slug: "vello", pageStart: 386, pageEnd: 395, pitchTitle: "Vello" },
  { slug: "dgen", pageStart: 396, pageEnd: 399, pitchTitle: "DGEN" },
];

/** Static path for title-slide logo exported from the master deck. */
export const DEMO_DAY_LOGO_DIR = "/images/teams/demo-day";

export function demoDayDeckViewUrl(pageStart: number): string {
  return `${DEMO_DAY_MASTER_VIEW_URL}#page-${pageStart}`;
}

export function demoDayDeckEmbedUrl(pageStart: number): string {
  return `https://www.canva.com/design/${DEMO_DAY_MASTER_DESIGN_ID}/view?embed#page-${pageStart}`;
}

export function deckUrlForSlug(slug: string): string | null {
  const mapping = DEMO_DAY_DECK_MAPPINGS.find((entry) => entry.slug === slug);
  return mapping ? demoDayDeckViewUrl(mapping.pageStart) : null;
}

export function deckMappingForSlug(slug: string): DemoDayDeckMapping | null {
  return DEMO_DAY_DECK_MAPPINGS.find((entry) => entry.slug === slug) ?? null;
}

export function logoUrlForSlug(slug: string): string | null {
  const mapping = DEMO_DAY_DECK_MAPPINGS.find((entry) => entry.slug === slug);
  if (!mapping) return null;
  return `${DEMO_DAY_LOGO_DIR}/${slug}.png`;
}
