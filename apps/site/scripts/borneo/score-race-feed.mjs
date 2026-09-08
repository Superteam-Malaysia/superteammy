#!/usr/bin/env node
/**
 * Score Amazing Race teams from the public feed API using current race-tasks point values.
 * Usage: node scripts/borneo/score-race-feed.mjs [feed.json]
 */
import fs from "fs";

const feedPath = process.argv[2] ?? "/tmp/race-feed-full.json";
const { feed } = JSON.parse(fs.readFileSync(feedPath, "utf8"));

/** Mirrors apps/site/src/borneo/data/race-tasks.ts + retired ids in validation.ts */
const POINTS = {
  "race-landed-in-kuching": 10,
  "content-overall-impressions": 10,
  "content-first-impressions": 10,
  "race-bourdain": 6,
  "race-kek-lapis": 4,
  "race-sams-ice-cream": 3,
  "race-ceylonese-naan": 4,
  "race-cats": 2,
  "race-word-sign": 4,
  "race-carpenter-street": 3,
  "race-kuching-waterfront": 2,
  "race-sampan-ride": 2,
  "race-flagpole-lean": 2,
  "race-flagpole-group": 2,
  "race-darul-hana-bridge": 3,
  "race-old-court-house": 3,
  "race-brookes-dockyard": 3,
  "race-traditional-attire": 5,
  "race-onboard-user": 10,
  "race-photobooth": 3,
};

const TASK_LABEL = {
  "race-landed-in-kuching": "#1 Landed",
  "content-overall-impressions": "#2 Impressions",
  "race-bourdain": "#3 Bourdain",
  "race-kek-lapis": "#4 Kek lapis",
  "race-sams-ice-cream": "#5 Ice cream",
  "race-ceylonese-naan": "#6 Naan",
  "race-cats": "#7 Cats",
  "race-word-sign": "#8 Word sign",
  "race-carpenter-street": "#9 Carpenter St",
  "race-kuching-waterfront": "#10 Waterfront",
  "race-sampan-ride": "#10 Sampan",
  "race-flagpole-lean": "#10 Flagpole lean",
  "race-flagpole-group": "#10 Flagpole group",
  "race-darul-hana-bridge": "#11 Bridge",
  "race-old-court-house": "#12 Court House",
  "race-brookes-dockyard": "#13 Dockyard",
  "race-traditional-attire": "#14 Attire",
  "race-onboard-user": "#15 Onboard",
  "race-photobooth": "#16 Photobooth",
};

function tweetId(url) {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : url.split("?")[0];
}

function pts(taskId) {
  return POINTS[taskId] ?? 0;
}

const teams = new Map();

for (const item of feed) {
  const label = item.groupLabel ?? `Solo · ${item.submitterName}`;
  const groupNumber = item.groupNumber ?? "—";
  if (!teams.has(label)) {
    teams.set(label, {
      label,
      groupNumber,
      total: 0,
      posts: 0,
      byMilestone: new Map(),
      byMember: new Map(),
      tweetIds: new Set(),
    });
  }
  const team = teams.get(label);
  const tid = tweetId(item.threadUrl);
  if (team.tweetIds.has(tid)) continue;
  team.tweetIds.add(tid);

  const p = pts(item.taskId);
  team.total += p;
  team.posts += 1;

  const mKey = TASK_LABEL[item.taskId] ?? item.taskId;
  team.byMilestone.set(mKey, (team.byMilestone.get(mKey) ?? 0) + p);
  team.byMember.set(item.submitterName, (team.byMember.get(item.submitterName) ?? 0) + p);
}

const ranked = [...teams.values()].sort((a, b) => b.total - a.total || b.posts - a.posts);

console.log("=== Amazing Race standings (new rules) ===");
console.log(`Feed: ${feed.length} rows · ${ranked.length} teams with points`);
console.log("Scoring: #1 & #2 = 10 pts each · #14 attire = 5 pts/post · all unique posts count\n");

const topN = Math.min(10, ranked.length);
for (let i = 0; i < topN; i++) {
  const t = ranked[i];
  console.log(`${i + 1}. ${t.label} (Group ${t.groupNumber}) — ${t.total} pts · ${t.posts} posts`);
  const milestones = [...t.byMilestone.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  console.log("   Milestones:", milestones.map(([k, v]) => `${k}: ${v}`).join(" · "));
  const members = [...t.byMember.entries()].sort((a, b) => b[1] - a[1]);
  console.log("   By member:", members.map(([n, v]) => `${n} (${v})`).join(" · "));
  console.log("");
}

console.log("=== Full ranking ===");
for (let i = 0; i < ranked.length; i++) {
  const t = ranked[i];
  console.log(`${String(i + 1).padStart(2)}. ${t.total.toString().padStart(3)} pts · ${t.posts} posts · ${t.label}`);
}
