import {
  CONTENT_TASKS,
  MILESTONE_SUBMIT_TASKS,
  RACE_CUTOFF,
  RACE_TASKS,
  type RaceTask,
} from "@borneo/data/race-tasks";

const THREAD_HOSTS = new Set(["twitter.com", "x.com", "www.twitter.com", "mobile.twitter.com"]);

const submitTaskIds = new Set(MILESTONE_SUBMIT_TASKS.map((task) => task.id));

/** Retired milestone ids — still resolve for early feed rows. */
const RETIRED_RACE_TASKS: RaceTask[] = [
  {
    id: "race-landed-in-kuching",
    number: 1,
    title: "First impressions of Kuching",
    shortDescription: "Individual content post — see Content Award.",
    details: [],
    pointsBase: 10,
    category: "content",
    theme: "content",
  },
];

export function getRaceTask(taskId: string): RaceTask | undefined {
  return (
    RACE_TASKS.find((task) => task.id === taskId) ??
    CONTENT_TASKS.find((task) => task.id === taskId) ??
    RETIRED_RACE_TASKS.find((task) => task.id === taskId)
  );
}

export function isValidRaceTaskId(taskId: string): boolean {
  return submitTaskIds.has(taskId);
}

export function isRaceCutoffPassed(now = new Date()): boolean {
  return now.getTime() > new Date(RACE_CUTOFF.iso).getTime();
}

/** Pull numeric tweet id from an x.com / twitter.com status URL. */
export function extractTweetIdFromUrl(raw: string): string | null {
  const normalized = normalizeThreadUrl(raw);
  if (!normalized) return null;
  const match = normalized.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

/** Accept x.com / twitter.com status URLs. Returns canonical https URL or null. */
export function normalizeThreadUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (!THREAD_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (!url.pathname.includes("/status/")) return null;

  url.protocol = "https:";
  url.hash = "";
  return url.toString();
}

/** True when two thread URLs point at the same X post. */
export function raceThreadUrlsMatch(a: string, b: string): boolean {
  const normalizedA = normalizeThreadUrl(a);
  const normalizedB = normalizeThreadUrl(b);
  if (!normalizedA || !normalizedB) return false;
  if (normalizedA === normalizedB) return true;

  const tweetA = extractTweetIdFromUrl(normalizedA);
  const tweetB = extractTweetIdFromUrl(normalizedB);
  return Boolean(tweetA && tweetB && tweetA === tweetB);
}

export function validateRaceSubmissionInput(taskId: string, threadUrl: string) {
  if (!isValidRaceTaskId(taskId)) {
    return { ok: false as const, error: "Unknown race task." };
  }

  const normalized = normalizeThreadUrl(threadUrl);
  if (!normalized) {
    return { ok: false as const, error: "Enter a valid X/Twitter thread URL (x.com/.../status/...)." };
  }

  if (isRaceCutoffPassed()) {
    return { ok: false as const, error: `Submissions closed — cutoff was ${RACE_CUTOFF.time} on ${RACE_CUTOFF.label}.` };
  }

  return { ok: true as const, taskId, threadUrl: normalized };
}
