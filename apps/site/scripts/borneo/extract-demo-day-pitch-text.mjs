#!/usr/bin/env node
/**
 * Lists Demo Day pitch page ranges for Canva MCP extraction.
 *
 * Canva PDF export (export-design) is blocked for shared deck IDs — use
 * get-design-content with the full share URL instead, then update
 * src/borneo/data/demo-day-pitch-copy.ts.
 *
 *   design: https://www.canva.com/design/DAHUnP-gC2s/OagvkJWU6pY1PR8OVJjLqg/edit
 */

const MAPPINGS = [
  ["fractionax", 20, 22, "Vori"],
  ["bario-seeker", 23, 32, "Bario Seeker"],
  ["shoqi-io", 33, 38, "SHOQI"],
  ["foresight", 39, 51, "hexo.fun"],
  ["socoe-impact", 52, 71, "Verita"],
  ["veya", 84, 102, "Veya"],
  ["solodeath", 103, 111, "SoloDeath"],
  ["float-finance", 112, 115, "Float Finance"],
  ["couch", 116, 127, "COUCH"],
  ["konrad-gnat", 128, 139, "Argo"],
  ["tuc", 140, 163, "TUC Event Wallet"],
  ["agent-ctos", 164, 179, "Agent CTOS"],
  ["webmerger", 180, 186, "Web#Merger"],
  ["breeze-pocket", 187, 216, "BreezePocket"],
  ["lp-agent", 217, 259, "LP Agent"],
  ["sugarsafe", 260, 279, "SugarSafe"],
  ["nextrare", 280, 294, "NextRare"],
  ["myhomecrowd", 295, 318, "Token Ledger"],
  ["mermail", 319, 330, "Mermail"],
  ["oneplan", 331, 355, "OnePlan Travel"],
  ["loofta-pay", 356, 375, "Loofta Pay"],
  ["kurtosis-ratings", 376, 385, "Kurtosis Ratings"],
  ["vello", 386, 395, "Vello"],
  ["dgen", 396, 399, "DGEN"],
];

console.log("Demo Day pitch page ranges (Canva get-design-content):\n");
for (const [slug, start, end, title] of MAPPINGS) {
  console.log(`  ${slug.padEnd(18)} p.${start}–${end}  (${title})`);
}
console.log("\nUpdate curated copy in src/borneo/data/demo-day-pitch-copy.ts");
