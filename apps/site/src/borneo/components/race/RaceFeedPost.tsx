"use client";

import Link from "@borneo/components/Link";
import { EmbeddedTweetCard } from "@borneo/components/shell/EmbeddedTweetCard";
import { extractTweetIdFromUrl } from "@borneo/lib/race/validation";
import type { RaceFeedItem } from "@borneo/lib/race/submissions";
import { withBasePath } from "@borneo/lib/base-path";

function formatFeedTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type RaceFeedPostProps = {
  item: RaceFeedItem;
};

export function RaceFeedPost({ item }: RaceFeedPostProps) {
  const tweetId = extractTweetIdFromUrl(item.threadUrl);
  const displayName = item.submitterName || "Participant";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  return (
    <article className="race-feed-post">
      <header className="race-feed-post__header">
        <div className="race-feed-post__avatar" aria-hidden>
          {avatarLetter}
        </div>
        <div className="race-feed-post__meta">
          <p className="race-feed-post__person">
            <span className="race-feed-post__person-name">{displayName}</span>
            {item.teamName && item.teamSlug ? (
              <Link href={withBasePath(`/teams/${item.teamSlug}`)} className="race-feed-post__team-tag">
                {item.teamName}
              </Link>
            ) : null}
          </p>
          <p className="race-feed-post__milestone">
            {item.taskTitle}
            <span className="race-feed-post__time"> · {formatFeedTime(item.submittedAt)}</span>
          </p>
        </div>
      </header>

      {tweetId ? (
        <EmbeddedTweetCard tweetId={tweetId} className="race-feed-post__tweet" />
      ) : (
        <a
          href={item.threadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="race-feed-post__fallback"
        >
          View post on X ↗
        </a>
      )}
    </article>
  );
}
