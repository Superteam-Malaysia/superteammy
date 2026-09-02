// Downscale images already sitting in Supabase storage.
//
// The upload UIs now resize before uploading, but anything uploaded before that
// is still a camera original -- 4096x2731 photos that the event dome draws at
// under 100px. Each costs ~45MB of RAM once decoded, which is what was killing
// mobile tabs.
//
// Re-encodes in place at the same object path, so no database rows change.
//
//   node scripts/resize-storage-images.mjs           # report only
//   node scripts/resize-storage-images.mjs --apply   # actually rewrite

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Run from apps/site so .env is picked up.");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const BUCKETS = [
  { name: "event-photos", maxWidth: 1600 },
  { name: "partner-logos", maxWidth: 800 },
  { name: "event-covers", maxWidth: 1600 },
  { name: "landing-images", maxWidth: 1600 },
  { name: "avatars", maxWidth: 400 },
  { name: "perk-icons", maxWidth: 400 },
];

const supabase = createClient(url, key, { auth: { persistSession: false } });
const mb = (n) => (n / 1048576).toFixed(1);

let totalBefore = 0, totalAfter = 0, changed = 0, skipped = 0;

for (const { name, maxWidth } of BUCKETS) {
  const { data: files, error } = await supabase.storage
    .from(name)
    .list("", { limit: 1000 });

  if (error) {
    console.log(`  ${name}: ${error.message} -- skipping`);
    continue;
  }
  if (!files?.length) continue;

  console.log(`\n${name} (${files.length} objects, max ${maxWidth}px)`);

  for (const f of files) {
    if (f.id === null) continue;                      // folder placeholder
    if (!/\.(jpe?g|png|webp)$/i.test(f.name)) continue;

    const { data: blob, error: dlErr } = await supabase.storage
      .from(name)
      .download(f.name);
    if (dlErr || !blob) continue;

    const input = Buffer.from(await blob.arrayBuffer());
    const meta = await sharp(input).metadata().catch(() => null);
    if (!meta?.width) continue;

    if (meta.width <= maxWidth) { skipped++; continue; }

    const output = await sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    totalBefore += input.length;
    totalAfter += output.length;
    changed++;

    const ramBefore = (meta.width * meta.height * 4) / 1048576;
    console.log(
      `  ${f.name}  ${meta.width}x${meta.height} -> ${maxWidth}px  ` +
        `${mb(input.length)}MB -> ${mb(output.length)}MB  (~${ramBefore.toFixed(0)}MB RAM saved)`
    );

    if (APPLY) {
      // Same object path, so every stored image_url keeps working. The bytes
      // are WebP while the extension may still say .jpeg -- browsers sniff the
      // content type, and contentType is set correctly here.
      const { error: upErr } = await supabase.storage
        .from(name)
        .upload(f.name, output, {
          upsert: true,
          contentType: "image/webp",
          cacheControl: "31536000",
        });
      if (upErr) console.error(`    ! ${upErr.message}`);
    }
  }
}

console.log(
  `\n${changed} oversized, ${skipped} already fine.  ` +
    `${mb(totalBefore)}MB -> ${mb(totalAfter)}MB on disk.`
);
console.log(APPLY ? "Applied." : "Dry run -- re-run with --apply to rewrite.");
