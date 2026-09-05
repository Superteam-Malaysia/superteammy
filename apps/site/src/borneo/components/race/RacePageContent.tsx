"use client";

import { useCallback, useState } from "react";
import { CtaButton } from "@borneo/components/ui";
import { RaceFeed } from "./RaceFeed";
import { MilestoneSubmitGate } from "./MilestoneSubmitDrawer";
import { RaceGroupPanel } from "./RaceGroupPanel";
import type { ParticipantTeamOption, PublicRaceSubmission, RaceFeedItem } from "@borneo/lib/race/submissions";
import type { ParticipantRaceGroup } from "@borneo/lib/race/group-types";

type RaceSubmissionContext = {
  participantName: string;
  teams: ParticipantTeamOption[];
  tagTeamSlug: string | null;
  initialSubmissions: PublicRaceSubmission[];
  cutoffPassed: boolean;
};

type RacePageContentProps = {
  isSignedIn?: boolean;
  initialFeed: RaceFeedItem[];
  initialGroup?: ParticipantRaceGroup | null;
  submission?: RaceSubmissionContext | null;
};

export function RacePageContent({
  isSignedIn = false,
  initialFeed,
  initialGroup = null,
  submission = null,
}: RacePageContentProps) {
  const [feed, setFeed] = useState(initialFeed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const prependFeedItem = useCallback((item: RaceFeedItem) => {
    setFeed((prev) => {
      const withoutDup = prev.filter(
        (row) => !(row.submitterId === item.submitterId && row.taskId === item.taskId),
      );
      return [item, ...withoutDup];
    });
  }, []);

  return (
    <div className="race-page">
      <header className="race-page__hero">
        <p className="race-page__lead">
          Complete milestones across Kuching — post proof on X, paste the link here. Your post shows up in the feed.
        </p>
      </header>

      <RaceGroupPanel isSignedIn={isSignedIn} initialGroup={initialGroup} />

      <div className="race-page__actions">
        <CtaButton
          variant="byte"
          size="md"
          showArrow={false}
          className="race-page__add-btn"
          onClick={openDrawer}
        >
          + Add milestone
        </CtaButton>
      </div>

      <RaceFeed items={feed} onAdd={openDrawer} />

      <button
        type="button"
        className="race-page__fab"
        aria-label="Add milestone"
        onClick={openDrawer}
      >
        +
      </button>

      <MilestoneSubmitGate
        isSignedIn={isSignedIn}
        open={drawerOpen}
        onClose={closeDrawer}
        submission={submission}
        onSubmitted={prependFeedItem}
      />

    </div>
  );
}
