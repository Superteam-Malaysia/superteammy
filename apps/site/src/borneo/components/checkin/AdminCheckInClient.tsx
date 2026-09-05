"use client";

import { useMemo, useState } from "react";
import type { CheckInGuest } from "@borneo/lib/checkin/admin";
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

type PendingAction = "checkIn" | "merch";

function matchesSearch(guest: CheckInGuest, query: string): boolean {
  if (!query) return true;
  const haystack = [
    guest.name,
    guest.email,
    guest.telegram,
    guest.ticketName,
    guest.guestId,
    guest.approvalStatus,
    guest.groupNumber != null ? String(guest.groupNumber) : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesFilter(
  guest: CheckInGuest,
  filter: CheckInFilter,
  groupsWithLeader: Set<number>,
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
        guest.groupNumber != null &&
        !groupsWithLeader.has(guest.groupNumber)
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
};

export function AdminCheckInClient({ initialGuests }: AdminCheckInClientProps) {
  const [guests, setGuests] = useState(initialGuests);
  const [filter, setFilter] = useState<CheckInFilter>("approved");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<{ id: string; action: PendingAction } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  const approvedGuests = useMemo(
    () => guests.filter((guest) => guest.approvalStatus === "approved"),
    [guests],
  );

  const groupLeaderState = useMemo(() => {
    const groupsWithLeader = new Set<number>();

    for (const guest of approvedGuests) {
      if (guest.amazingRaceLeader && guest.groupNumber != null) {
        groupsWithLeader.add(guest.groupNumber);
      }
    }

    const groupNumbers = new Set(
      approvedGuests.map((guest) => guest.groupNumber).filter((n): n is number => n != null),
    );

    return {
      groupsWithLeader,
      groupCount: groupNumbers.size,
      groupsWithoutLeader: [...groupNumbers].filter((n) => !groupsWithLeader.has(n)).length,
    };
  }, [approvedGuests]);

  const stats = useMemo(() => {
    const checkedIn = approvedGuests.filter((guest) => guest.checkedInAt).length;
    const merchReceived = approvedGuests.filter((guest) => guest.merchReceivedAt).length;
    const raceLeaders = approvedGuests.filter((guest) => guest.amazingRaceLeader).length;

    return {
      approved: approvedGuests.length,
      checkedIn,
      merchReceived,
      raceLeaders,
      groupCount: groupLeaderState.groupCount,
    };
  }, [approvedGuests, groupLeaderState.groupCount]);

  const visibleGuests = useMemo(
    () =>
      guests.filter(
        (guest) =>
          matchesFilter(guest, filter, groupLeaderState.groupsWithLeader) &&
          matchesSearch(guest, query),
      ),
    [guests, filter, query, groupLeaderState.groupsWithLeader],
  );

  async function patchGuest(
    guest: CheckInGuest,
    action: PendingAction,
    payload: { checkedIn?: boolean; merchReceived?: boolean },
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

  function toggleCheckIn(guest: CheckInGuest) {
    void patchGuest(guest, "checkIn", { checkedIn: !guest.checkedInAt });
  }

  function toggleMerch(guest: CheckInGuest) {
    void patchGuest(guest, "merch", { merchReceived: !guest.merchReceivedAt });
  }

  return (
    <div className="admin-checkin">
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
          <span className="admin-checkin__stat-value">{stats.groupCount}</span>
          <span className="admin-checkin__stat-label">Groups</span>
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
          placeholder="Search name, email, group…"
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
        Showing {visibleGuests.length} guest{visibleGuests.length === 1 ? "" : "s"} · groups are assigned on the
        Amazing Race page
      </p>

      {visibleGuests.length === 0 ? (
        <p className="text-sm text-[var(--color-wisp)]/60">No guests match this filter.</p>
      ) : (
        <div className="admin-submissions-table-wrap">
          <table className="admin-submissions-table admin-checkin__table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Group</th>
                <th>Arrival</th>
                <th>Merch</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleGuests.map((guest) => {
                const checkedIn = Boolean(guest.checkedInAt);
                const merchReceived = Boolean(guest.merchReceivedAt);
                const checkInPending = pending?.id === guest.id && pending.action === "checkIn";
                const merchPending = pending?.id === guest.id && pending.action === "merch";

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
                      {guest.groupNumber != null ? (
                        <span className="admin-checkin__badge admin-checkin__badge--race">
                          {guest.groupNumber}
                          {guest.amazingRaceLeader ? " · Leader" : ""}
                        </span>
                      ) : (
                        <span className="admin-checkin__badge admin-checkin__badge--out">—</span>
                      )}
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
