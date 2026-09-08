"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RaceFeedItem } from "@borneo/lib/race/submissions";
import { CtaButton } from "@borneo/components/ui";
import { RaceFeedPost } from "./RaceFeedPost";

type RaceFeedProps = {
  items: RaceFeedItem[];
  onAdd?: () => void;
  addLabel?: string;
};

const NO_TEAM_KEY = "__no_team__";

function teamKey(item: RaceFeedItem): string {
  return item.groupLabel?.trim() || NO_TEAM_KEY;
}

function teamLabel(key: string): string {
  return key === NO_TEAM_KEY ? "No team" : key;
}

function FilterIcon() {
  return (
    <svg
      className="race-feed__filter-icon"
      width="10"
      height="10"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M1.5 2h13l-5 6.2V14l-3-1.5V8.2L1.5 2zm2.1 1 3.4 4.2v3.3l1 0.5V7.2L11.4 3H3.6z"
      />
    </svg>
  );
}

export function RaceFeed({ items, onAdd, addLabel = "+ Add milestone" }: RaceFeedProps) {
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const teams = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = teamKey(item);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => teamLabel(a).localeCompare(teamLabel(b)))
      .map(([key, count]) => ({ key, label: teamLabel(key), count }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!teamFilter) return items;
    return items.filter((item) => teamKey(item) === teamFilter);
  }, [items, teamFilter]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  if (!items.length) {
    return (
      <div className="race-feed race-feed--empty">
        <p className="race-feed__empty-title">No milestones yet</p>
        <p className="race-feed__empty-copy">
          Pick a milestone, paste your X link — photos and video come from your post.
        </p>
        {onAdd ? (
          <CtaButton
            variant="byte"
            size="md"
            showArrow={false}
            className="race-page__add-btn"
            onClick={onAdd}
          >
            {addLabel}
          </CtaButton>
        ) : null}
      </div>
    );
  }

  return (
    <div className="race-feed">
      {teams.length > 1 ? (
        <div className="race-feed__toolbar" ref={toolbarRef}>
          <button
            type="button"
            className={[
              "race-feed__filter-btn",
              teamFilter ? "race-feed__filter-btn--active" : "",
              menuOpen ? "race-feed__filter-btn--open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={teamFilter ? `Filter: ${teamLabel(teamFilter)}` : "Filter by team"}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <FilterIcon />
            {teamFilter ? <span className="race-feed__filter-dot" aria-hidden /> : null}
          </button>

          {menuOpen ? (
            <ul className="race-feed__filter-menu list-none" role="listbox">
              <li role="option" aria-selected={!teamFilter}>
                <button
                  type="button"
                  className={["race-feed__filter-option", !teamFilter ? "is-active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    setTeamFilter(null);
                    setMenuOpen(false);
                  }}
                >
                  All teams
                  <span className="race-feed__filter-count">{items.length}</span>
                </button>
              </li>
              {teams.map((team) => (
                <li key={team.key} role="option" aria-selected={teamFilter === team.key}>
                  <button
                    type="button"
                    className={[
                      "race-feed__filter-option",
                      teamFilter === team.key ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setTeamFilter(team.key);
                      setMenuOpen(false);
                    }}
                  >
                    {team.label}
                    <span className="race-feed__filter-count">{team.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!filtered.length ? (
        <p className="race-feed__filter-empty">No posts for this team.</p>
      ) : (
        filtered.map((item) => <RaceFeedPost key={item.id} item={item} />)
      )}
    </div>
  );
}
