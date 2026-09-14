#!/usr/bin/env node
/**
 * Download Demo Day pitch slide thumbnails from Canva manifest.
 * Regenerate manifest via Canva get-design-pages (see extract-demo-day-pitch-text.mjs).
 *
 *   node scripts/borneo/download-demo-day-slides.mjs
 *   node scripts/borneo/download-demo-day-slides.mjs veya   # one team only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "demo-day-slides-manifest.json");
const outRoot = path.join(__dirname, "../../public/images/teams/demo-day/slides");

if (!fs.existsSync(manifestPath)) {
  console.error("Missing manifest:", manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const onlySlug = process.argv[2];

const slugs = onlySlug ? [onlySlug] : Object.keys(manifest);
let ok = 0;
let fail = 0;

for (const slug of slugs) {
  const pages = manifest[slug];
  if (!pages) {
    console.error(`Unknown slug: ${slug}`);
    process.exit(1);
  }

  const dir = path.join(outRoot, slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const [page, url] of Object.entries(pages)) {
    const dest = path.join(dir, `${page}.png`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      ok++;
      if (ok % 25 === 0) console.log(`… ${ok} slides`);
    } catch (err) {
      console.error(`FAIL ${slug} p${page}:`, err.message);
      fail++;
    }
  }
  console.log(`OK ${slug} (${Object.keys(pages).length} slides)`);
}

console.log(`Done: ${ok} saved, ${fail} failed → ${outRoot}`);
