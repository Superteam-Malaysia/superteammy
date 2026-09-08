/** Waterfront activity ids — #10 split into three flat-scoring stations. */
export const WATERFRONT_ACTIVITY_TASK_IDS = [
  "race-sampan-ride",
  "race-flagpole-lean",
  "race-flagpole-group",
] as const;

export type WaterfrontActivityTaskId = (typeof WATERFRONT_ACTIVITY_TASK_IDS)[number];

export const RETIRED_WATERFRONT_TASK_ID = "race-kuching-waterfront";

/** Manual overrides when tweet text/media is empty (tweet id → activity). */
export const WATERFRONT_TWEET_ID_OVERRIDES: Record<string, WaterfrontActivityTaskId> = {
  /** Zhi Cong — media-only post; team thread context is waterfront sampan ride. */
  "2097172441290387605": "race-sampan-ride",
};

export function extractTweetIdFromThreadUrl(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

/** Classify tweet copy into a waterfront activity id. */
export function classifyWaterfrontTweetText(text: string): WaterfrontActivityTaskId | null {
  const t = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (!t || t.startsWith("http://") || t.startsWith("https://")) return null;

  if (/sampan|astana|fort margherita|boat ride|river ride|took a boat|sarawak river/.test(t)) {
    return "race-sampan-ride";
  }
  if (/lean(ing)?.*flagpole|flagpole.*lean|against the (giant )?flagpole/.test(t)) {
    return "race-flagpole-lean";
  }
  if (/under the (giant )?flagpole|group.*flagpole|flagpole.*group|beneath the flagpole/.test(t)) {
    return "race-flagpole-group";
  }
  if (/flagpole/.test(t)) return "race-flagpole-lean";
  if (/waterfront/.test(t) && /ride|cross|across|river|film/.test(t)) {
    return "race-sampan-ride";
  }

  return null;
}

export function classifyWaterfrontThreadUrl(
  threadUrl: string,
  tweetText = "",
): WaterfrontActivityTaskId {
  const tweetId = extractTweetIdFromThreadUrl(threadUrl);
  if (tweetId && WATERFRONT_TWEET_ID_OVERRIDES[tweetId]) {
    return WATERFRONT_TWEET_ID_OVERRIDES[tweetId];
  }

  const fromText = classifyWaterfrontTweetText(tweetText);
  if (fromText) return fromText;

  /** Last resort — keeps post credited; sampan is the most common activity in feed. */
  return "race-sampan-ride";
}

/** Fetch tweet text via fxtwitter (public, no auth). Returns empty string on failure. */
export async function fetchTweetTextForClassification(threadUrl: string): Promise<string> {
  const match = threadUrl.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i);
  if (!match) return "";

  const [, handle, tweetId] = match;
  try {
    const res = await fetch(`https://api.fxtwitter.com/${handle}/status/${tweetId}`, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      tweet?: { text?: string; raw_text?: { text?: string } };
    };
    return (data.tweet?.text ?? data.tweet?.raw_text?.text ?? "").trim();
  } catch {
    return "";
  }
}

export async function resolveWaterfrontActivityTaskId(
  threadUrl: string,
): Promise<WaterfrontActivityTaskId> {
  const text = await fetchTweetTextForClassification(threadUrl);
  return classifyWaterfrontThreadUrl(threadUrl, text);
}
