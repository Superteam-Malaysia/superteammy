#!/usr/bin/env tsx
/**
 * Audit Amazing Race submissions for duplicate tweets and spoofing signals.
 * Usage: DATABASE_URL=... npm run borneo:db:audit-race
 */
import "dotenv/config";
import { closeDb, getDb } from "../../src/borneo/lib/db";
import { participants, raceSubmissions, raceTeams } from "../../src/borneo/lib/db/schema";
import { eq } from "drizzle-orm";
import { extractTweetIdFromUrl, normalizeThreadUrl, raceThreadUrlsMatch } from "../../src/borneo/lib/race/validation";
import { getRaceTask } from "../../src/borneo/lib/race/validation";

type Row = {
  id: string;
  taskId: string;
  threadUrl: string;
  submittedAt: Date;
  updatedAt: Date;
  submitterId: string;
  submitterName: string | null;
  submitterEmail: string | null;
  raceTeamName: string | null;
};

function tweetKey(url: string): string {
  return extractTweetIdFromUrl(url) ?? normalizeThreadUrl(url) ?? url;
}

function xHandle(url: string): string | null {
  const m = url.match(/x\.com\/([^/]+)\/status\//i) ?? url.match(/twitter\.com\/([^/]+)\/status\//i);
  return m?.[1]?.toLowerCase() ?? null;
}

async function main() {
  const db = getDb();
  const rows = await db
    .select({
      id: raceSubmissions.id,
      taskId: raceSubmissions.taskId,
      threadUrl: raceSubmissions.threadUrl,
      submittedAt: raceSubmissions.submittedAt,
      updatedAt: raceSubmissions.updatedAt,
      submitterId: raceSubmissions.submittedBy,
      submitterName: participants.name,
      submitterEmail: participants.email,
      raceTeamName: raceTeams.name,
    })
    .from(raceSubmissions)
    .innerJoin(participants, eq(raceSubmissions.submittedBy, participants.id))
    .leftJoin(raceTeams, eq(participants.raceTeamId, raceTeams.id));

  console.log(`\n=== Amazing Race audit (${rows.length} raw submissions) ===\n`);

  // 1. Duplicate tweet IDs across any submissions
  const byTweet = new Map<string, Row[]>();
  for (const row of rows) {
    const key = tweetKey(row.threadUrl);
    if (!byTweet.has(key)) byTweet.set(key, []);
    byTweet.get(key)!.push(row);
  }

  const crossDupes = [...byTweet.entries()].filter(([, r]) => r.length > 1);
  console.log(`Unique tweet IDs: ${byTweet.size}`);
  console.log(`Duplicate tweets (same post used more than once): ${crossDupes.length}\n`);

  if (crossDupes.length > 0) {
    console.log("--- DUPLICATE TWEETS ---");
    for (const [tid, dupRows] of crossDupes.sort((a, b) => b[1].length - a[1].length)) {
      console.log(`Tweet ${tid}:`);
      for (const r of dupRows) {
        const task = getRaceTask(r.taskId);
        console.log(
          `  • ${r.submitterName ?? r.submitterEmail} | ${task?.title ?? r.taskId} | ${r.threadUrl}`,
        );
        console.log(`    submitted ${r.submittedAt.toISOString()} | updated ${r.updatedAt.toISOString()}`);
      }
      console.log("");
    }
  } else {
    console.log("✓ No duplicate tweet IDs in raw submissions.\n");
  }

  // 2. Same participant + task (should be impossible)
  const byPersonTask = new Map<string, Row[]>();
  for (const row of rows) {
    const k = `${row.submitterId}:${row.taskId}`;
    if (!byPersonTask.has(k)) byPersonTask.set(k, []);
    byPersonTask.get(k)!.push(row);
  }
  const personTaskDupes = [...byPersonTask.entries()].filter(([, r]) => r.length > 1);
  console.log(`Same person + same task rows: ${personTaskDupes.length}`);
  if (personTaskDupes.length > 0) {
    for (const [, dupRows] of personTaskDupes) {
      console.log("  BUG:", dupRows[0].submitterName, dupRows[0].taskId);
    }
  } else {
    console.log("✓ One row per person per task (DB constraint holding).\n");
  }

  // 3. Per-person: same tweet reused across different tasks
  console.log("--- Same person reusing one tweet for multiple tasks ---");
  const byPerson = new Map<string, Row[]>();
  for (const row of rows) byPerson.set(row.submitterId, [...(byPerson.get(row.submitterId) ?? []), row]);

  let personReuse = 0;
  for (const [, personRows] of byPerson) {
    const tweets = new Map<string, string[]>();
    for (const r of personRows) {
      const k = tweetKey(r.threadUrl);
      if (!tweets.has(k)) tweets.set(k, []);
      tweets.get(k)!.push(r.taskId);
    }
    for (const [tid, taskIds] of tweets) {
      if (taskIds.length > 1) {
        personReuse++;
        const name = personRows[0].submitterName ?? personRows[0].submitterEmail;
        console.log(`${name}: tweet ${tid}`);
        for (const taskId of taskIds) {
          const task = getRaceTask(taskId);
          console.log(`  - ${task?.title ?? taskId}`);
        }
      }
    }
  }
  if (personReuse === 0) console.log("✓ None.\n");
  else console.log("");

  // 4. X handle mismatch (submitter name vs tweet author — heuristic spoof signal)
  console.log("--- X handle vs submitter name (manual review) ---");
  const handleGroups = new Map<string, Set<string>>();
  for (const row of rows) {
    const handle = xHandle(row.threadUrl);
    if (!handle) continue;
    if (!handleGroups.has(row.submitterId)) handleGroups.set(row.submitterId, new Set());
    handleGroups.get(row.submitterId)!.add(handle);
  }

  let multiHandle = 0;
  for (const row of rows) {
    const handles = handleGroups.get(row.submitterId);
    if (!handles || handles.size <= 1) continue;
    if (multiHandle === 0 || ![...handleGroups.values()].some((s) => s.size > 1)) break;
  }

  for (const [submitterId, handles] of handleGroups) {
    if (handles.size <= 1) continue;
    multiHandle++;
    const person = rows.find((r) => r.submitterId === submitterId);
    console.log(`${person?.submitterName ?? submitterId} posts from multiple X accounts: ${[...handles].join(", ")}`);
  }
  if (multiHandle === 0) console.log("✓ Each submitter uses a single X handle.\n");
  else console.log("");

  // 5. Suspicious: different people same X handle
  console.log("--- Same X handle used by different submitters ---");
  const handleToPeople = new Map<string, { id: string; name: string }[]>();
  for (const row of rows) {
    const handle = xHandle(row.threadUrl);
    if (!handle) continue;
    if (!handleToPeople.has(handle)) handleToPeople.set(handle, []);
    const list = handleToPeople.get(handle)!;
    if (!list.some((p) => p.id === row.submitterId)) {
      list.push({ id: row.submitterId, name: row.submitterName ?? row.submitterEmail ?? "?" });
    }
  }

  let sharedHandle = 0;
  for (const [handle, people] of handleToPeople) {
    if (people.length <= 1) continue;
    sharedHandle++;
    console.log(`@${handle}: ${people.map((p) => p.name).join(" + ")}`);
  }
  if (sharedHandle === 0) console.log("✓ No X account shared across different SVB profiles.\n");
  else console.log("");

  // 6. URL variants pointing to same tweet (updated submissions)
  console.log("--- URL normalization pairs (same tweet, different query strings) ---");
  let normPairs = 0;
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      if (rows[i].threadUrl === rows[j].threadUrl) continue;
      if (raceThreadUrlsMatch(rows[i].threadUrl, rows[j].threadUrl)) {
        normPairs++;
        console.log(`${rows[i].submitterName} / ${rows[j].submitterName}: ${tweetKey(rows[i].threadUrl)}`);
      }
    }
  }
  if (normPairs === 0) console.log("✓ None beyond duplicate check above.\n");
  else console.log("");

  // 7. Summary stats
  console.log("--- Top submitters ---");
  const counts = [...byPerson.entries()]
    .map(([id, r]) => ({ name: r[0].submitterName ?? r[0].submitterEmail, count: r.length, team: r[0].raceTeamName }))
    .sort((a, b) => b.count - a.count);
  for (const c of counts.slice(0, 15)) {
    console.log(`${c.name}: ${c.count} submissions (${c.team ?? "no race group"})`);
  }

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
