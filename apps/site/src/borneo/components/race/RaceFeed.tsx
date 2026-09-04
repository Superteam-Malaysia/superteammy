"use client";

import type { RaceFeedItem } from "@borneo/lib/race/submissions";
import { RaceFeedPost } from "./RaceFeedPost";

type RaceFeedProps = {
  items: RaceFeedItem[];
};

export function RaceFeed({ items }: RaceFeedProps) {
  if (!items.length) {
    return (
      <div className="race-feed race-feed--empty">
        <p className="race-feed__empty-title">No milestones yet</p>
        <p className="race-feed__empty-copy">
          Be the first team to complete a station — tap + to pick a milestone and paste your X post.
        </p>
      </div>
    );
  }

  return (
    <div className="race-feed">
      {items.map((item) => (
        <RaceFeedPost key={item.id} item={item} />
      ))}
    </div>
  );
}
