#!/usr/bin/env tsx
/**
 * Patch participant Telegram handles by email (normalized).
 * Usage: DATABASE_URL=... npm run borneo:db:patch-telegram-handles
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants } from "../../src/borneo/lib/db/schema";
import { normalizeEmail } from "../../src/borneo/lib/auth/session";

/** email (lowercase) → t.me URL or @handle */
const TELEGRAM_PATCHES: Record<string, string> = {
  "nicfuryyy@gmail.com": "https://t.me/NicFuryy",
  "lisa.bechina@gmail.com": "https://t.me/looftaxyz",
  "ronak01.raj@gmail.com": "https://t.me/ronakrajrauniyar",
  "zufairyk@gmail.com": "https://t.me/along7t",
  "nizarsyahmi37@gmail.com": "https://t.me/nizarsyahmi37",
  "53845tianbelulok@gmail.com": "https://t.me/sebestdebest",
  "kuehtzenan1995@gmail.com": "https://t.me/artist_dream7",
  "yudhishthra@aqua0.xyz": "https://t.me/yudhishthra",
  "venessa@madisevents.com": "https://t.me/venessaamen",
  "emailsolah@gmail.com": "https://t.me/solahidris",
  "luma@mvn.xyz": "https://t.me/BrittInTech",
  "skky5687@gmail.com": "https://t.me/skyyy0x",
  "rafieqrafizie@gmail.com": "https://t.me/rrafieq",
  "chinbingyong@gmail.com": "https://t.me/mage777",
  "mark@sirachventures.com": "https://t.me/HQ1_F",
  "dave.chew@myhomecrowd.com": "https://t.me/davewychew",
  "keeyushee@gmail.com": "https://t.me/Yushee",
};

function toTelegramField(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  if (trimmed.startsWith("@")) return `https://t.me/${trimmed.slice(1)}`;
  return `https://t.me/${trimmed}`;
}

async function main() {
  const db = getDb();

  for (const [email, handle] of Object.entries(TELEGRAM_PATCHES)) {
    const emailNormalized = normalizeEmail(email);
    const telegram = toTelegramField(handle);

    const [row] = await db
      .update(participants)
      .set({ telegram, updatedAt: new Date() })
      .where(eq(participants.emailNormalized, emailNormalized))
      .returning({ id: participants.id, name: participants.name, telegram: participants.telegram });

    if (row) {
      console.log(`Patched: ${row.name ?? email} → ${telegram}`);
    } else {
      console.warn(`Not found: ${email}`);
    }
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
