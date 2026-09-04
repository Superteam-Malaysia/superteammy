"use client";

import { EmbeddedTweet, TweetNotFound, TweetSkeleton, useTweet } from "react-tweet";
import "react-tweet/theme.css";

type EmbeddedTweetCardProps = {
  tweetId: string;
  className?: string;
};

/** Embedded X post — supports video tweets from Superteam MY. */
export function EmbeddedTweetCard({ tweetId, className }: EmbeddedTweetCardProps) {
  const { data, error, isLoading } = useTweet(tweetId);

  return (
    <div className={["embedded-tweet-card", className].filter(Boolean).join(" ")}>
      {isLoading ? <TweetSkeleton /> : null}
      {!isLoading && (error || !data) ? <TweetNotFound error={error} /> : null}
      {!isLoading && data ? <EmbeddedTweet tweet={data} /> : null}
    </div>
  );
}
