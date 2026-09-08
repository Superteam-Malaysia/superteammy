import fs from "fs";

const feedPath = process.argv[2] ?? "/tmp/race-feed.json";
const { feed } = JSON.parse(fs.readFileSync(feedPath, "utf8"));

function tweetId(url) {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : url.split("?")[0];
}

function norm(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return tweetId(u.toString()) || u.toString().split("?")[0];
  } catch {
    return url;
  }
}

const byTweet = new Map();
for (const item of feed) {
  const tid = norm(item.threadUrl);
  if (!byTweet.has(tid)) byTweet.set(tid, []);
  byTweet.get(tid).push(item);
}

const dupes = [...byTweet.entries()].filter(([, rows]) => rows.length > 1);

console.log("Total feed items:", feed.length);
console.log("Unique tweet IDs:", byTweet.size);
console.log("Duplicate tweet IDs (cross-submitter or cross-task):", dupes.length);
console.log("--- DUPLICATES ---");
for (const [tid, rows] of dupes.sort((a, b) => b[1].length - a[1].length)) {
  console.log(`TWEET ${tid}`);
  for (const r of rows) {
    console.log(`  - ${r.submitterName} | ${r.taskTitle} (${r.taskId}) | ${r.submittedAt}`);
    console.log(`    ${r.threadUrl}`);
  }
  console.log("");
}

const byPersonTask = new Map();
for (const item of feed) {
  const k = `${item.submitterId}:${item.taskId}`;
  if (!byPersonTask.has(k)) byPersonTask.set(k, []);
  byPersonTask.get(k).push(item);
}
const personTaskDupes = [...byPersonTask.entries()].filter(([, r]) => r.length > 1);
console.log("--- Same submitter + same task (DB should prevent) ---");
console.log("Count:", personTaskDupes.length);
for (const [, rows] of personTaskDupes) {
  console.log(rows[0].submitterName, rows[0].taskId, rows.map((r) => r.threadUrl));
}

console.log("--- Per-person: same tweet reused for multiple tasks ---");
const byPerson = new Map();
for (const item of feed) {
  if (!byPerson.has(item.submitterId)) byPerson.set(item.submitterId, []);
  byPerson.get(item.submitterId).push(item);
}
for (const [, rows] of byPerson) {
  const tweets = new Map();
  for (const r of rows) {
    const tid = norm(r.threadUrl);
    if (!tweets.has(tid)) tweets.set(tid, []);
    tweets.get(tid).push({ taskId: r.taskId, title: r.taskTitle });
  }
  for (const [tid, tasks] of tweets) {
    if (tasks.length > 1) {
      console.log(`${rows[0].submitterName}: tweet ${tid}`);
      for (const t of tasks) console.log(`  - ${t.title} (${t.taskId})`);
    }
  }
}

console.log("--- Top submitters by count ---");
for (const [, rows] of [...byPerson.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 20)) {
  console.log(`${rows[0].submitterName}: ${rows.length} submissions, ${rows[0].groupLabel ?? "no group"}`);
}
