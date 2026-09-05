"use client";

import Link from "@borneo/components/Link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MAX_RACE_GROUP_SIZE, type ParticipantRaceGroup } from "@borneo/lib/race/group-types";
import { raceTeamLabel } from "@borneo/lib/race/group-label";
import { withBasePath } from "@borneo/lib/base-path";

type RaceGroupPanelProps = {
  isSignedIn: boolean;
  initialGroup: ParticipantRaceGroup | null;
  variant?: "page" | "drawer";
  onGroupChange?: (group: ParticipantRaceGroup) => void;
};

export function RaceGroupPanel({
  isSignedIn,
  initialGroup,
  variant = "page",
  onGroupChange,
}: RaceGroupPanelProps) {
  const [group, setGroup] = useState<ParticipantRaceGroup | null>(initialGroup);
  const [pending, setPending] = useState<"leader" | "join" | "leave" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    setGroup(initialGroup);
  }, [initialGroup]);

  const joinableGroups = useMemo(() => {
    if (!group) return [];
    return group.groups
      .filter((item) => !item.isFull && item.leaderName)
      .sort((a, b) => a.number - b.number);
  }, [group]);

  useEffect(() => {
    if (!selectedGroup) return;
    const stillOpen = joinableGroups.some((item) => String(item.number) === selectedGroup);
    if (!stillOpen) setSelectedGroup("");
  }, [joinableGroups, selectedGroup]);

  async function patchGroup(payload: Record<string, unknown>) {
    setError(null);
    const res = await fetch(withBasePath("/api/race/group"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; group?: ParticipantRaceGroup };

    if (!res.ok || !data.group) {
      throw new Error(data.error ?? "Could not update group.");
    }

    setGroup(data.group);
    onGroupChange?.(data.group);
    return data.group;
  }

  async function becomeLeader() {
    setPending("leader");
    setError(null);
    try {
      await patchGroup({ action: "becomeLeader" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start group.");
    } finally {
      setPending(null);
    }
  }

  async function joinSelectedGroup(event: FormEvent) {
    event.preventDefault();
    if (!selectedGroup) return;

    setPending("join");
    setError(null);
    try {
      await patchGroup({ groupNumber: Number.parseInt(selectedGroup, 10) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join group.");
    } finally {
      setPending(null);
    }
  }

  async function leaveGroup() {
    setPending("leave");
    setError(null);
    try {
      await patchGroup({ action: "leave" });
      setSelectedGroup("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not leave group.");
    } finally {
      setPending(null);
    }
  }

  const panelClass =
    variant === "drawer" ? "race-group-panel race-group-panel--drawer" : "race-group-panel";

  if (!isSignedIn) {
    if (variant === "drawer") return null;

    return (
      <section className={panelClass}>
        <p className="race-group-panel__lead">
          Sign in to join an Amazing Race group (max {MAX_RACE_GROUP_SIZE} people).
        </p>
        <Link href={withBasePath("/login")} className="race-group-panel__link">
          Sign in →
        </Link>
      </section>
    );
  }

  if (!group) {
    return null;
  }

  const inGroup = group.groupNumber != null;

  return (
    <section className={panelClass} aria-label="Amazing Race group">
      {inGroup ? (
        <div className="race-group-panel__status">
          <p className="race-group-panel__title">
            {group.isLeader ? "You're the leader" : (raceTeamLabel(group.leaderName) ?? "Your group")}
          </p>
          <p className="race-group-panel__meta">
            {group.isLeader && raceTeamLabel(group.leaderName)
              ? `${raceTeamLabel(group.leaderName)} · `
              : null}
            {group.memberCount} / {MAX_RACE_GROUP_SIZE} in your group
          </p>
          <button
            type="button"
            className="race-group-panel__leave"
            disabled={Boolean(pending)}
            onClick={() => void leaveGroup()}
          >
            {pending === "leave" ? "Leaving…" : "Leave group"}
          </button>
        </div>
      ) : (
        <div className="race-group-panel__pick">
          <p className="race-group-panel__lead">
            Start a new group or join one — max {MAX_RACE_GROUP_SIZE} people per group.
          </p>

          <button
            type="button"
            className="race-group-panel__leader-btn"
            disabled={Boolean(pending)}
            onClick={() => void becomeLeader()}
          >
            {pending === "leader" ? "Assigning…" : "Become leader"}
          </button>

          <form className="race-group-panel__join" onSubmit={(event) => void joinSelectedGroup(event)}>
            <div className="race-group-panel__join-label">
              <span className="race-group-panel__join-heading">Join a group</span>
              {joinableGroups.length === 0 ? (
                <span className="race-group-panel__join-empty">No open groups yet — become a leader to start one.</span>
              ) : (
                <ul
                  className="race-group-panel__join-list"
                  role="listbox"
                  aria-label="Open Amazing Race groups"
                >
                  {joinableGroups.map((summary) => {
                    const label = raceTeamLabel(summary.leaderName)!;
                    const isSelected = selectedGroup === String(summary.number);
                    return (
                      <li key={summary.number} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={
                            isSelected
                              ? "race-group-panel__join-option race-group-panel__join-option--selected"
                              : "race-group-panel__join-option"
                          }
                          disabled={Boolean(pending)}
                          onClick={() => setSelectedGroup(String(summary.number))}
                        >
                          <span className="race-group-panel__join-option-name">{label}</span>
                          <span className="race-group-panel__join-option-meta">
                            {summary.memberCount}/{MAX_RACE_GROUP_SIZE}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="race-group-panel__join-btn"
              disabled={Boolean(pending) || !selectedGroup || joinableGroups.length === 0}
            >
              {pending === "join" ? "Joining…" : "Join group"}
            </button>
          </form>
        </div>
      )}

      {error ? <p className="team-form__error">{error}</p> : null}
    </section>
  );
}
