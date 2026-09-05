"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CheckInGuest, RaceTeamOption } from "@borneo/lib/checkin/admin";
import { withBasePath } from "@borneo/lib/base-path";

type CheckInFilter =
  | "approved"
  | "checked-in"
  | "not-checked-in"
  | "merch-received"
  | "no-merch"
  | "race-leaders"
  | "no-race-leader"
  | "all";

type PendingAction = "checkIn" | "merch" | "raceLeader" | "raceTeam";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuching",
  });
}

function matchesSearch(guest: CheckInGuest, query: string): boolean {
  if (!query) return true;
  const haystack = [
    guest.name,
    guest.email,
    guest.telegram,
    guest.ticketName,
    guest.guestId,
    guest.approvalStatus,
    guest.raceTeam?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesFilter(
  guest: CheckInGuest,
  filter: CheckInFilter,
  raceTeamsWithLeader: Set<string>,
): boolean {
  const isApproved = guest.approvalStatus === "approved";
  const isCheckedIn = Boolean(guest.checkedInAt);
  const hasMerch = Boolean(guest.merchReceivedAt);
  const isRaceLeader = guest.amazingRaceLeader;

  switch (filter) {
    case "approved":
      return isApproved;
    case "checked-in":
      return isApproved && isCheckedIn;
    case "not-checked-in":
      return isApproved && !isCheckedIn;
    case "merch-received":
      return isApproved && hasMerch;
    case "no-merch":
      return isApproved && !hasMerch;
    case "race-leaders":
      return isApproved && isRaceLeader;
    case "no-race-leader":
      return (
        isApproved &&
        Boolean(guest.raceTeam) &&
        !raceTeamsWithLeader.has(guest.raceTeam!.id)
      );
    case "all":
      return true;
  }
}

const FILTERS: { id: CheckInFilter; label: string }[] = [
  { id: "approved", label: "Approved" },
  { id: "not-checked-in", label: "Not checked in" },
  { id: "checked-in", label: "Checked in" },
  { id: "no-merch", label: "No merch yet" },
  { id: "merch-received", label: "Merch received" },
  { id: "race-leaders", label: "Group leaders" },
  { id: "no-race-leader", label: "Groups w/o leader" },
  { id: "all", label: "All guests" },
];

function mergeGuests(prev: CheckInGuest[], updated: CheckInGuest[]): CheckInGuest[] {
  const byId = new Map(prev.map((guest) => [guest.id, guest]));
  for (const guest of updated) {
    byId.set(guest.id, guest);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

type AdminCheckInClientProps = {
  initialGuests: CheckInGuest[];
  initialRaceTeams: RaceTeamOption[];
};

export function AdminCheckInClient({
  initialGuests,
  initialRaceTeams,
}: AdminCheckInClientProps) {
  const [guests, setGuests] = useState(initialGuests);
  const [raceTeams, setRaceTeams] = useState(initialRaceTeams);
  const [filter, setFilter] = useState<CheckInFilter>("approved");
  const [search, setSearch] = useState("");
  const [newRaceTeamName, setNewRaceTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [pending, setPending] = useState<{ id: string; action: PendingAction } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  const approvedGuests = useMemo(
    () => guests.filter((guest) => guest.approvalStatus === "approved"),
    [guests],
  );

  const raceTeamLeaderState = useMemo(() => {
    const raceTeamsWithLeader = new Set<string>();
    const allRaceTeamIds = new Set(raceTeams.map((team) => team.id));

    for (const guest of approvedGuests) {
      if (guest.amazingRaceLeader && guest.raceTeam) {
        raceTeamsWithLeader.add(guest.raceTeam.id);
      }
    }

    return {
      raceTeamsWithLeader,
      raceTeamsWithoutLeader: allRaceTeamIds.size - raceTeamsWithLeader.size,
    };
  }, [approvedGuests, raceTeams]);

  const stats = useMemo(() => {
    const checkedIn = approvedGuests.filter((guest) => guest.checkedInAt).length;
    const merchReceived = approvedGuests.filter((guest) => guest.merchReceivedAt).length;
    const raceLeaders = approvedGuests.filter((guest) => guest.amazingRaceLeader).length;
    const onRaceTeam = approvedGuests.filter((guest) => guest.raceTeam).length;

    return {
      approved: approvedGuests.length,
      checkedIn,
      notCheckedIn: approvedGuests.length - checkedIn,
      merchReceived,
      raceLeaders,
      onRaceTeam,
      raceTeamsWithoutLeader: raceTeamLeaderState.raceTeamsWithoutLeader,
    };
  }, [approvedGuests, raceTeamLeaderState.raceTeamsWithoutLeader]);

  const visibleGuests = useMemo(
    () =>
      guests.filter(
        (guest) =>
          matchesFilter(guest, filter, raceTeamLeaderState.raceTeamsWithLeader) &&
          matchesSearch(guest, query),
      ),
    [guests, filter, query, raceTeamLeaderState.raceTeamsWithLeader],
  );

  async function patchGuest(
    guest: CheckInGuest,
    action: PendingAction,
    payload: {
      checkedIn?: boolean;
      merchReceived?: boolean;
      amazingRaceLeader?: boolean;
      raceTeamId?: string | null;
    },
  ) {
    setPending({ id: guest.id, action });
    setError(null);

    try {
      const res = await fetch(withBasePath("/api/admin/checkin"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: guest.id, ...payload }),
      });
      const data = (await res.json()) as {
        error?: string;
        guest?: CheckInGuest;
        guests?: CheckInGuest[];
      };

      if (!res.ok || !data.guest) {
        setError(data.error ?? "Could not save.");
        return;
      }

      const updated = data.guests?.length ? data.guests : [data.guest];
      setGuests((prev) => mergeGuests(prev, updated));
    } catch {
      setError("Could not save.");
    } finally {
      setPending(null);
    }
  }

  async function createRaceTeam(event: FormEvent) {
    event.preventDefault();
    const name = newRaceTeamName.trim();
    if (!name) return;

    setCreatingTeam(true);
    setError(null);

    try {
      const res = await fetch(withBasePath("/api/admin/race-teams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { error?: string; raceTeam?: RaceTeamOption };

      if (!res.ok || !data.raceTeam) {
        setError(data.error ?? "Could not create ops group.");
        return;
      }

      setRaceTeams((prev) =>
        [...prev, data.raceTeam!].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewRaceTeamName("");
    } catch {
      setError("Could not create ops group.");
    } finally {
      setCreatingTeam(false);
    }
  }

  function toggleCheckIn(guest: CheckInGuest) {
    void patchGuest(guest, "checkIn", { checkedIn: !guest.checkedInAt });
  }

  function toggleMerch(guest: CheckInGuest) {
    void patchGuest(guest, "merch", { merchReceived: !guest.merchReceivedAt });
  }

  function toggleRaceLeader(guest: CheckInGuest) {
    void patchGuest(guest, "raceLeader", { amazingRaceLeader: !guest.amazingRaceLeader });
  }

  function assignRaceTeam(guest: CheckInGuest, raceTeamId: string | null) {
    void patchGuest(guest, "raceTeam", { raceTeamId });
  }

  return (
    <div className="admin-checkin">
      <form className="admin-checkin__create-team" onSubmit={(event) => void createRaceTeam(event)}>
        <label className="admin-checkin__create-team-label">
          <span className="team-form__label">New ops group (internal)</span>
          <input
            type="text"
            value={newRaceTeamName}
            onChange={(event) => setNewRaceTeamName(event.target.value)}
            placeholder="e.g. WhatsApp group name — not published on site"
            className="team-form__input"
          />
        </label>
        <button
          type="submit"
          disabled={creatingTeam || !newRaceTeamName.trim()}
          className="admin-checkin__action admin-checkin__action--race"
        >
          {creatingTeam ? "Creating…" : "Create group"}
        </button>
      </form>

      <div className="admin-checkin__stats admin-checkin__stats--grid">
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.checkedIn}</span>
          <span className="admin-checkin__stat-label">Checked in</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.merchReceived}</span>
          <span className="admin-checkin__stat-label">Merch received</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.raceLeaders}</span>
          <span className="admin-checkin__stat-label">Group leaders</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.onRaceTeam}</span>
          <span className="admin-checkin__stat-label">In ops groups</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.approved}</span>
          <span className="admin-checkin__stat-label">Approved total</span>
        </div>
      </div>

      <div className="admin-checkin__toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, ops group…"
          className="admin-checkin__search team-form__input"
          aria-label="Search guests"
        />
        <div className="admin-checkin__filters" role="tablist" aria-label="Check-in filters">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={
                filter === item.id ? "admin-checkin__filter admin-checkin__filter--active" : "admin-checkin__filter"
              }
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="team-form__error">{error}</p> : null}

      <p className="admin-checkin__count">
        Showing {visibleGuests.length} guest{visibleGuests.length === 1 ? "" : "s"} · {raceTeams.length} ops group
        {raceTeams.length === 1 ? "" : "s"} (internal)
      </p>

      {visibleGuests.length === 0 ? (
        <p className="text-sm text-[var(--color-wisp)]/60">No guests match this filter.</p>
      ) : (
        <div className="admin-submissions-table-wrap">
          <table className="admin-submissions-table admin-checkin__table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Ops group</th>
                <th>Arrival</th>
                <th>Merch</th>
                <th>Leader</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleGuests.map((guest) => {
                const checkedIn = Boolean(guest.checkedInAt);
                const merchReceived = Boolean(guest.merchReceivedAt);
                const isRaceLeader = guest.amazingRaceLeader;
                const checkInPending = pending?.id === guest.id && pending.action === "checkIn";
                const merchPending = pending?.id === guest.id && pending.action === "merch";
                const raceLeaderPending = pending?.id === guest.id && pending.action === "raceLeader";
                const raceTeamPending = pending?.id === guest.id && pending.action === "raceTeam";

                return (
                  <tr key={guest.id} className={checkedIn && merchReceived ? "admin-checkin__row--done" : undefined}>
                    <td>
                      <span className="admin-checkin__name">{guest.name}</span>
                      <span className="admin-submissions-table__email">{guest.email}</span>
                      {guest.telegram ? (
                        <span className="admin-submissions-table__email">{guest.telegram}</span>
                      ) : null}
                      {guest.approvalStatus !== "approved" ? (
                        <span className="admin-checkin__approval">{guest.approvalStatus ?? "unknown"}</span>
                      ) : null}
                    </td>
                    <td>
                      <select
                        className="admin-checkin__select team-form__input"
                        value={guest.raceTeam?.id ?? ""}
                        disabled={Boolean(pending)}
                        onChange={(event) =>
                          assignRaceTeam(guest, event.target.value ? event.target.value : null)
                        }
                        aria-label={`Ops group for ${guest.name}`}
                      >
                        <option value="">Unassigned</option>
                        {raceTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      {raceTeamPending ? (
                        <span className="admin-checkin__timestamp">Saving…</span>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={
                          checkedIn
                            ? "admin-checkin__badge admin-checkin__badge--in"
                            : "admin-checkin__badge admin-checkin__badge--out"
                        }
                      >
                        {checkedIn ? "Checked in" : "Not yet"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          merchReceived
                            ? "admin-checkin__badge admin-checkin__badge--merch"
                            : "admin-checkin__badge admin-checkin__badge--out"
                        }
                      >
                        {merchReceived ? "Received" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          isRaceLeader
                            ? "admin-checkin__badge admin-checkin__badge--race"
                            : "admin-checkin__badge admin-checkin__badge--out"
                        }
                      >
                        {isRaceLeader ? "Leader" : guest.raceTeam ? "Member" : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-checkin__actions">
                        <button
                          type="button"
                          className={
                            checkedIn
                              ? "admin-checkin__action admin-checkin__action--undo"
                              : "admin-checkin__action admin-checkin__action--check"
                          }
                          disabled={Boolean(pending)}
                          onClick={() => toggleCheckIn(guest)}
                        >
                          {checkInPending ? "Saving…" : checkedIn ? "Undo check-in" : "Check in"}
                        </button>
                        <button
                          type="button"
                          className={
                            merchReceived
                              ? "admin-checkin__action admin-checkin__action--undo"
                              : "admin-checkin__action admin-checkin__action--merch"
                          }
                          disabled={Boolean(pending)}
                          onClick={() => toggleMerch(guest)}
                        >
                          {merchPending ? "Saving…" : merchReceived ? "Undo merch" : "Merch received"}
                        </button>
                        <button
                          type="button"
                          className={
                            isRaceLeader
                              ? "admin-checkin__action admin-checkin__action--undo"
                              : "admin-checkin__action admin-checkin__action--race"
                          }
                          disabled={Boolean(pending) || !guest.raceTeam}
                          onClick={() => toggleRaceLeader(guest)}
                          title={
                            guest.raceTeam
                              ? "One leader per ops group — internal only"
                              : "Assign an ops group first"
                          }
                        >
                          {raceLeaderPending
                            ? "Saving…"
                            : isRaceLeader
                              ? "Remove leader"
                              : "Group leader"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
