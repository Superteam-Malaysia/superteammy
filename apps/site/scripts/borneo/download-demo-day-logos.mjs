#!/usr/bin/env node
/**
 * Download Demo Day title-slide thumbnails from Canva to public/images/teams/demo-day/.
 * Regenerate manifest with Canva get-design-pages, then: node scripts/borneo/download-demo-day-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "demo-day-logo-manifest.json");
const outDir = path.join(__dirname, "../../public/images/teams/demo-day");

if (!fs.existsSync(manifestPath)) {
  console.error("Missing manifest:", manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

for (const [slug, entry] of Object.entries(manifest)) {
  const dest = path.join(outDir, `${slug}.png`);
  const res = await fetch(entry.url);
  if (!res.ok) {
    console.error(`FAIL ${slug}: HTTP ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`OK ${slug} (page ${entry.page}) → ${dest}`);
}
