"use client";

import Link from "@borneo/components/Link";
import { useCallback, useState } from "react";
import { RACE_CUTOFF } from "@borneo/data/race-tasks";
import { RaceFeed } from "./RaceFeed";
import { MilestoneSubmitGate } from "./MilestoneSubmitDrawer";
import type { ParticipantTeamOption } from "./RaceSubmissionsPanel";
import type { PublicRaceSubmission, RaceFeedItem } from "@borneo/lib/race/submissions";
import { withBasePath } from "@borneo/lib/base-path";

type RaceSubmissionContext = {
  teams: ParticipantTeamOption[];
  initialTeamSlug: string | null;
  initialSubmissions: PublicRaceSubmission[];
  cutoffPassed: boolean;
};

type RacePageContentProps = {
  isSignedIn?: boolean;
  isOrganizer?: boolean;
  initialFeed: RaceFeedItem[];
  submission?: RaceSubmissionContext | null;
};

export function RacePageContent({
  isSignedIn = false,
  isOrganizer = false,
  initialFeed,
  submission = null,
}: RacePageContentProps) {
  const [feed, setFeed] = useState(initialFeed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const prependFeedItem = useCallback((item: RaceFeedItem) => {
    setFeed((prev) => {
      const withoutDup = prev.filter(
        (row) => !(row.teamSlug === item.teamSlug && row.taskId === item.taskId),
      );
      return [item, ...withoutDup];
    });
  }, []);

  return (
    <div className="race-page">
      <header className="race-page__hero">
        <p className="race-page__eyebrow">Startup Village Borneo</p>
        <h1 className="race-page__title">Amazing Race</h1>
        <p className="race-page__lead">
          Complete milestones across Kuching — post proof on X, paste the link here. Your post shows up in the feed.
        </p>
      </header>

      <p className="race-page__cutoff">
        {RACE_CUTOFF.label} · {RACE_CUTOFF.time} cutoff
      </p>

      <RaceFeed items={feed} />

      <button
        type="button"
        className="race-page__fab"
        aria-label="Add milestone"
        onClick={() => setDrawerOpen(true)}
      >
        +
      </button>

      <MilestoneSubmitGate
        isSignedIn={isSignedIn}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        submission={submission}
        onSubmitted={prependFeedItem}
      />

      {isOrganizer ? (
        <p className="race-page__admin">
          <Link
            href={withBasePath("/admin/submissions")}
            className="text-[var(--color-byte)] hover:underline font-[family-name:var(--font-mono)] text-sm"
          >
            Review all submissions →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
