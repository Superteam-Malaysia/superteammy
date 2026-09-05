"use client";

import { CtaButton } from "@borneo/components/ui";

type TeamDetailActionsProps = {
  slug: string;
};

export function TeamDetailActions(_props: TeamDetailActionsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <CtaButton href="/teams" variant="ghost-wisp" size="md" showArrow={false}>
        All teams
      </CtaButton>
    </div>
  );
}
