#!/usr/bin/env tsx
/**
 * Patch participant social handles by email (normalized).
 * Sources: Demo Day deck OCR / PDF links, Luma proof-of-work URLs.
 * Usage: DATABASE_URL=... npm run borneo:db:patch-telegram-handles
 *
 * Only fills empty fields unless `force: true` on a row (rare).
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants, teams } from "../../src/borneo/lib/db/schema";
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
  "eirie.luma@mvn.xyz": "https://t.me/eiriemyt",
  "skky5687@gmail.com": "https://t.me/skyyy0x",
  "rafieqrafizie@gmail.com": "https://t.me/rrafieq",
  "chinbingyong@gmail.com": "https://t.me/mage777",
  "mark@sirachventures.com": "https://t.me/HQ1_F",
  "dave.chew@myhomecrowd.com": "https://t.me/davewychew",
  "keeyushee@gmail.com": "https://t.me/Yushee",
  "hpy5c8whjc@privaterelay.appleid.com": "https://t.me/ImaniKml",
  "toanbku@gmail.com": "https://t.me/toanhq",
};

/**
 * email → X / Twitter handle or URL.
 * Prefer personal handles; project accounts only when that is what the deck shows for the person.
 */
const TWITTER_PATCHES: Record<string, string> = {
  // Deck contact slides
  "alialeexin@gmail.com": "@_alialee", // COUCH
  "emailsolah@gmail.com": "@solodeathapp", // SoloDeath
  "nizarsyahmi37@gmail.com": "@madebyvori", // Vori
  "samishaofficial68@gmail.com": "@Float_fi", // Float
  "antony.peech@gmail.com": "@aapecherkin", // ContentDC
  "chuhninaann@gmail.com": "@b4b_world", // ContentDC (also @ContentDC brand)
  "menghong6988@gmail.com": "@mengo6988", // hexo.fun
  "echai2905@gmail.com": "@easonchaiii", // hexo.fun
  "toanbku@gmail.com": "@lpagent_io", // LP Agent
  "leqdat18@gmail.com": "@lpagent_io",
  "mihthanh27@gmail.com": "@lpagent_io",
  // Luma proof-of-work
  "gaditi723@gmail.com": "@OnchainAditi",
  "53845tianbelulok@gmail.com": "@sebestdebest",
};

const LINKEDIN_PATCHES: Record<string, string> = {
  // PDF link annotations (LP Agent team slide)
  "mihthanh27@gmail.com": "https://www.linkedin.com/in/thanhlm/",
  "toanbku@gmail.com": "https://www.linkedin.com/in/toanhq/",
  // Luma proof-of-work
  "konradmgnat@gmail.com": "https://www.linkedin.com/in/konrad-gnat",
  "xchase_96@hotmail.com": "https://www.linkedin.com/in/nicholas-lok-49387b14b",
  "53845tianbelulok@gmail.com": "https://www.linkedin.com/in/sebastian-belulok",
};

/** Prefer profile roots over one-off repos when a clean user exists. */
const GITHUB_PATCHES: Record<string, string> = {
  "heroch94@gmail.com": "https://github.com/CHplus2",
  "jameswong9562@gmail.com": "https://github.com/drnkgn",
  "yiethin.socoe@gmail.com": "https://github.com/YieThinSoong",
  "ivan.sim@socoe.co": "https://github.com/Ricesuu",
  "michaeltan.socoe@gmail.com": "https://github.com/tan-mike",
  "scottspeedster502015isthebest@gmail.com": "https://github.com/edison9733",
  "14leeren@gmail.com": "https://github.com/derek2403",
  "jingyuan0926@gmail.com": "https://github.com/JingYuan0926",
  "dominique@reifydb.com": "https://github.com/reifydb",
  "chinooo.eth@gmail.com": "https://github.com/Chinchinooo",
  "hi@pew.dev": "https://github.com/pewdotdev",
  "samishaofficial68@gmail.com": "https://github.com/Samisha68",
  "rafaeitahir@hotmail.com": "https://github.com/RafaTahir",
  "echai2905@gmail.com": "https://github.com/easonchai",
  "derekliew0@gmail.com": "https://github.com/derek2403",
  "goodwin.icon@gmail.com": "https://github.com/dgen-technologies",
  "dr.frankenmiller@gmail.com": "https://github.com/frankenmiller",
  "yudhishthra@aqua0.xyz": "https://github.com/0xyudhishthra",
  "nizarsyahmi37@gmail.com": "https://github.com/nizarsyahmi37",
  "53845tianbelulok@gmail.com": "https://github.com/belulok",
  "luma@mvn.xyz": "https://github.com/blockchainmom",
  "kuehtzenan1995@gmail.com": "https://github.com/tuc7ak",
};

const INSTAGRAM_PATCHES: Record<string, string> = {
  "venessa@madisevents.com": "https://www.instagram.com/tucswk",
};

const WEBSITE_PATCHES: Record<string, string> = {
  "alialeexin@gmail.com": "https://alialee.framer.website/",
};

/** Team slug → canonical website (from decks / pitch). Fills empty or weak vercel placeholders. */
const TEAM_WEBSITE_PATCHES: Record<string, string> = {
  "float-finance": "https://justfloat.xyz",
  fractionax: "https://www.madebyvori.com",
  "lp-agent": "https://lpagent.io",
  solodeath: "https://solodeath.com",
  contentdc: "https://contentdc.com",
  aqua0: "https://aqua0.xyz",
  foresight: "https://hexo.fun",
  argo: "https://myargoquest.com",
  dgen: "https://card.dgentech.io",
  "webmerger": "https://webmerger.vercel.app",
};

function toTelegramField(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  if (trimmed.startsWith("@")) return `https://t.me/${trimmed.slice(1)}`;
  return `https://t.me/${trimmed}`;
}

function toTwitterField(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://x.com/${handle}`;
}

function toHttpsField(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return `https://${trimmed}`;
}

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim();
}

async function patchField(
  email: string,
  column: "telegram" | "twitterUrl" | "linkedinUrl" | "githubUrl" | "instagramUrl" | "websiteUrl",
  raw: string,
  normalize: (v: string) => string,
) {
  const db = getDb();
  const emailNormalized = normalizeEmail(email);
  const next = normalize(raw);

  const [existing] = await db
    .select({
      id: participants.id,
      name: participants.name,
      telegram: participants.telegram,
      twitterUrl: participants.twitterUrl,
      linkedinUrl: participants.linkedinUrl,
      githubUrl: participants.githubUrl,
      instagramUrl: participants.instagramUrl,
      websiteUrl: participants.websiteUrl,
    })
    .from(participants)
    .where(eq(participants.emailNormalized, emailNormalized))
    .limit(1);

  if (!existing) {
    console.warn(`Not found: ${email} (${column})`);
    return;
  }

  const current = existing[column];
  if (!isBlank(current)) {
    console.log(`Skip ${column} (already set): ${existing.name ?? email} → ${current}`);
    return;
  }

  const [row] = await db
    .update(participants)
    .set({ [column]: next, updatedAt: new Date() })
    .where(eq(participants.emailNormalized, emailNormalized))
    .returning({ id: participants.id, name: participants.name, [column]: participants[column] });

  console.log(`${column} patched: ${row?.name ?? email} → ${next}`);
}

async function patchTeamWebsites() {
  const db = getDb();
  for (const [slug, websiteUrl] of Object.entries(TEAM_WEBSITE_PATCHES)) {
    const [existing] = await db
      .select({ id: teams.id, name: teams.name, websiteUrl: teams.websiteUrl })
      .from(teams)
      .where(eq(teams.slug, slug))
      .limit(1);
    if (!existing) {
      console.warn(`Team not found: ${slug}`);
      continue;
    }
    const current = existing.websiteUrl?.trim() ?? "";
    const weak =
      !current ||
      current.includes("fractionax.app") ||
      (slug === "float-finance" && !current.includes("justfloat")) ||
      (slug === "lp-agent" && !current.includes("lpagent.io")) ||
      (slug === "foresight" && current.includes("vercel.app"));
    if (!weak && current === websiteUrl) {
      console.log(`Team website ok: ${existing.name} → ${current}`);
      continue;
    }
    if (!weak) {
      console.log(`Skip team website (kept): ${existing.name} → ${current}`);
      continue;
    }
    await db
      .update(teams)
      .set({ websiteUrl, updatedAt: new Date() })
      .where(eq(teams.id, existing.id));
    console.log(`Team website patched: ${existing.name} (${slug}) → ${websiteUrl}`);
  }
}

async function main() {
  for (const [email, handle] of Object.entries(TELEGRAM_PATCHES)) {
    await patchField(email, "telegram", handle, toTelegramField);
  }
  for (const [email, handle] of Object.entries(TWITTER_PATCHES)) {
    await patchField(email, "twitterUrl", handle, toTwitterField);
  }
  for (const [email, handle] of Object.entries(LINKEDIN_PATCHES)) {
    await patchField(email, "linkedinUrl", handle, toHttpsField);
  }
  for (const [email, handle] of Object.entries(GITHUB_PATCHES)) {
    await patchField(email, "githubUrl", handle, toHttpsField);
  }
  for (const [email, handle] of Object.entries(INSTAGRAM_PATCHES)) {
    await patchField(email, "instagramUrl", handle, toHttpsField);
  }
  for (const [email, handle] of Object.entries(WEBSITE_PATCHES)) {
    await patchField(email, "websiteUrl", handle, toHttpsField);
  }
  await patchTeamWebsites();
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
