"use client";

import type { RaceFeedItem } from "@borneo/lib/race/submissions";
import { CtaButton } from "@borneo/components/ui";
import { RaceFeedPost } from "./RaceFeedPost";

type RaceFeedProps = {
  items: RaceFeedItem[];
  onAdd?: () => void;
  addLabel?: string;
};

export function RaceFeed({ items, onAdd, addLabel = "+ Add milestone" }: RaceFeedProps) {
  if (!items.length) {
    return (
      <div className="race-feed race-feed--empty">
        <p className="race-feed__empty-title">No milestones yet</p>
        <p className="race-feed__empty-copy">
          Pick a milestone, paste your X link — photos and video come from your post.
        </p>
        {onAdd ? (
          <CtaButton variant="byte" size="md" showArrow={false} onClick={onAdd}>
            {addLabel}
          </CtaButton>
        ) : null}
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
