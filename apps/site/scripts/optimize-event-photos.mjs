// Downscale the event dome photos.
//
// The originals are 2560x1440. A decoded bitmap costs width*height*4 bytes of
// RAM regardless of how small the file is, so each one was ~14.7MB decoded and
// the 32-image dome held ~450MB -- past the point where iOS Safari kills the
// tab. The dome renders each photo a few hundred pixels wide, so the extra
// resolution bought nothing.
//
// Writes <name>.webp next to each original; the .jpeg files are left alone.
//
//   node scripts/optimize-event-photos.mjs

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public/images/events");
const MAX_WIDTH = 900; // ~2x the widest a dome tile is drawn
const QUALITY = 80;

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (files.length === 0) {
  console.error(`No source images in ${DIR}`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const file of files.sort()) {
  const src = path.join(DIR, file);
  const out = path.join(DIR, file.replace(/\.(jpe?g|png)$/i, ".webp"));

  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  before += (await stat(src)).size;
  after += (await stat(out)).size;
}

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `${files.length} images: ${mb(before)}MB -> ${mb(after)}MB on disk ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`
);
