/** Master Demo Day deck — Startup Village Borneo, Sept 9 2026 */
export const DEMO_DAY_MASTER_DESIGN_ID = "DAHUnP-gC2s";

export const DEMO_DAY_MASTER_VIEW_URL = `https://www.canva.com/design/${DEMO_DAY_MASTER_DESIGN_ID}/view`;

export type DemoDayDeckMapping = {
  slug: string;
  pageStart: number;
  pageEnd: number;
  pitchTitle: string;
  /** Standalone Canva copy of this team's pages only (not the 405-page master). */
  designId: string;
};

/**
 * Pitch ranges verified from master-deck page thumbnails (`/tmp/canva-all/{NNN}.png`),
 * not the Canva content API (that API mixes pages when batched).
 * Each `designId` is a `copy-design` of those master page numbers.
 */
export const DEMO_DAY_DECK_MAPPINGS: DemoDayDeckMapping[] = [
  { slug: "fractionax", pageStart: 15, pageEnd: 21, pitchTitle: "Vori", designId: "DAHVMYj4pTY" },
  { slug: "bario-seeker", pageStart: 22, pageEnd: 33, pitchTitle: "Bario Seeker", designId: "DAHVMVCMOs0" },
  { slug: "shoqi-io", pageStart: 34, pageEnd: 38, pitchTitle: "SHOQI", designId: "DAHVMUrgHK8" },
  { slug: "edventures", pageStart: 39, pageEnd: 54, pitchTitle: "Edventures Wallet", designId: "DAHVMcSMMnw" },
  { slug: "foresight", pageStart: 55, pageEnd: 66, pitchTitle: "hexo.fun", designId: "DAHVMZOG91I" },
  { slug: "socoe-impact", pageStart: 67, pageEnd: 76, pitchTitle: "Verita", designId: "DAHVMYV2OBk" },
  { slug: "aqua0", pageStart: 77, pageEnd: 92, pitchTitle: "Aqua0", designId: "DAHVMWOuDzs" },
  { slug: "veya", pageStart: 93, pageEnd: 102, pitchTitle: "Veya", designId: "DAHVMVSEcEE" },
  { slug: "solodeath", pageStart: 103, pageEnd: 112, pitchTitle: "SoloDeath", designId: "DAHVMTinmyI" },
  { slug: "sea-digital-markets", pageStart: 113, pageEnd: 122, pitchTitle: "Aether", designId: "DAHVMQMG0cE" },
  { slug: "float-finance", pageStart: 123, pageEnd: 132, pitchTitle: "Float Finance", designId: "DAHVMQW8b18" },
  { slug: "couch", pageStart: 133, pageEnd: 142, pitchTitle: "COUCH", designId: "DAHVMTMNJmE" },
  { slug: "contentdc", pageStart: 143, pageEnd: 152, pitchTitle: "ContentDC", designId: "DAHVMeTDJsE" },
  { slug: "argo", pageStart: 153, pageEnd: 162, pitchTitle: "Argo", designId: "DAHVMf6w-B0" },
  { slug: "tuc", pageStart: 164, pageEnd: 173, pitchTitle: "TUC Event Wallet", designId: "DAHVMTzgVKU" },
  { slug: "agent-ctos", pageStart: 174, pageEnd: 186, pitchTitle: "Agent CTOS", designId: "DAHVMZLLQfU" },
  { slug: "webmerger", pageStart: 187, pageEnd: 198, pitchTitle: "Web#Merger", designId: "DAHVMfwDQ9g" },
  { slug: "breeze-pocket", pageStart: 199, pageEnd: 210, pitchTitle: "BreezePocket", designId: "DAHVMbfcOd8" },
  { slug: "lp-agent", pageStart: 217, pageEnd: 232, pitchTitle: "LP Agent", designId: "DAHVMcrQI8k" },
  { slug: "soda", pageStart: 233, pageEnd: 240, pitchTitle: "SODA", designId: "DAHVMTpFU1c" },
  { slug: "sugarsafe", pageStart: 241, pageEnd: 255, pitchTitle: "SugarSafe", designId: "DAHVMY_HSgI" },
  { slug: "nextrare", pageStart: 256, pageEnd: 265, pitchTitle: "NextRare", designId: "DAHVMcj0nM8" },
  { slug: "rewardy-wallet", pageStart: 266, pageEnd: 285, pitchTitle: "Rewardy Wallet", designId: "DAHVMXIYjDA" },
  { slug: "myhomecrowd", pageStart: 294, pageEnd: 307, pitchTitle: "Token Ledger", designId: "DAHVMbTXL9U" },
  { slug: "mermail", pageStart: 308, pageEnd: 319, pitchTitle: "Mermail", designId: "DAHVMf8AwQY" },
  { slug: "oneplan", pageStart: 320, pageEnd: 335, pitchTitle: "OnePlan Travel", designId: "DAHVMTm1HA4" },
  { slug: "loofta-pay", pageStart: 336, pageEnd: 350, pitchTitle: "Loofta Pay", designId: "DAHVMVRB1CY" },
  { slug: "kurtosis-ratings", pageStart: 351, pageEnd: 360, pitchTitle: "Kurtosis Labs", designId: "DAHVMU5XJIU" },
  { slug: "vello", pageStart: 361, pageEnd: 385, pitchTitle: "Vello", designId: "DAHVMR8pm0I" },
  { slug: "dgen", pageStart: 387, pageEnd: 398, pitchTitle: "DGEN", designId: "DAHVMThQkec" },
];

/** Static path for title-slide logo exported from the master deck. */
export const DEMO_DAY_LOGO_DIR = "/images/teams/demo-day";

/** Per-page pitch slide screenshots (Canva thumbnails). */
export const DEMO_DAY_SLIDES_DIR = "/images/teams/demo-day/slides";

export function demoDayTeamViewUrl(designId: string): string {
  return `https://www.canva.com/design/${designId}/view`;
}

export function demoDayTeamEmbedUrl(designId: string): string {
  return `https://www.canva.com/design/${designId}/view?embed`;
}

export function demoDayPdfUrl(slug: string): string {
  return `/images/teams/demo-day/decks/${slug}.pdf`;
}

export function demoDayDeckViewUrl(pageStart: number): string {
  return `${DEMO_DAY_MASTER_VIEW_URL}#page-${pageStart}`;
}

export function demoDayDeckEmbedUrl(pageStart: number): string {
  return `https://www.canva.com/design/${DEMO_DAY_MASTER_DESIGN_ID}/view?embed#page-${pageStart}`;
}

export function deckUrlForSlug(slug: string): string | null {
  const mapping = DEMO_DAY_DECK_MAPPINGS.find((entry) => entry.slug === slug);
  return mapping ? demoDayPdfUrl(mapping.slug) : null;
}

export function deckMappingForSlug(slug: string): DemoDayDeckMapping | null {
  return DEMO_DAY_DECK_MAPPINGS.find((entry) => entry.slug === slug) ?? null;
}

export function deckSlidePathsForSlug(slug: string): string[] {
  const mapping = deckMappingForSlug(slug);
  if (!mapping) return [];
  const slides: string[] = [];
  const count = mapping.pageEnd - mapping.pageStart + 1;
  for (let i = 1; i <= count; i++) {
    slides.push(`${DEMO_DAY_SLIDES_DIR}/${slug}/${String(i).padStart(2, "0")}.png`);
  }
  return slides;
}
