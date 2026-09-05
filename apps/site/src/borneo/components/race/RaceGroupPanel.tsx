"use client";

import Link from "@borneo/components/Link";
import { FormEvent, useMemo, useState } from "react";
import { MAX_RACE_GROUP_SIZE, type ParticipantRaceGroup } from "@borneo/lib/race/group-types";
import { withBasePath } from "@borneo/lib/base-path";

type RaceGroupPanelProps = {
  isSignedIn: boolean;
  initialGroup: ParticipantRaceGroup | null;
};

export function RaceGroupPanel({ isSignedIn, initialGroup }: RaceGroupPanelProps) {
  const [group, setGroup] = useState<ParticipantRaceGroup | null>(initialGroup);
  const [pending, setPending] = useState<"leader" | "join" | "leave" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");

  const joinOptions = useMemo(() => {
    if (!group) return [];
    return group.groups
      .filter((item) => !item.isFull)
      .map((item) => item.number)
      .sort((a, b) => a - b);
  }, [group]);

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

  if (!isSignedIn) {
    return (
      <section className="race-group-panel">
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
    <section className="race-group-panel" aria-label="Amazing Race group">
      {inGroup ? (
        <div className="race-group-panel__status">
          <p className="race-group-panel__title">
            Group {group.groupNumber}
            {group.isLeader ? " · Leader" : ""}
          </p>
          <p className="race-group-panel__meta">
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
            <label className="race-group-panel__join-label">
              <span>Join a group</span>
              <select
                className="race-group-panel__select team-form__input"
                value={selectedGroup}
                disabled={Boolean(pending) || joinOptions.length === 0}
                onChange={(event) => setSelectedGroup(event.target.value)}
              >
                <option value="">
                  {joinOptions.length === 0 ? "No open groups yet" : "Pick a number…"}
                </option>
                {joinOptions.map((number) => {
                  const summary = group.groups.find((item) => item.number === number);
                  const count = summary?.memberCount ?? 0;
                  return (
                    <option key={number} value={number}>
                      Group {number} ({count}/{MAX_RACE_GROUP_SIZE})
                    </option>
                  );
                })}
              </select>
            </label>
            <button
              type="submit"
              className="race-group-panel__join-btn"
              disabled={Boolean(pending) || !selectedGroup}
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
