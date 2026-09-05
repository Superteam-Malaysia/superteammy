"use client";

import { useMemo, useState } from "react";
import { raceTeamLabel } from "@borneo/lib/race/group-label";
import type { CheckInGuest } from "@borneo/lib/checkin/admin";
import { withBasePath } from "@borneo/lib/base-path";

type CheckInFilter =
  | "approved"
  | "checked-in"
  | "not-checked-in"
  | "merch-received"
  | "no-merch"
  | "groups"
  | "all";

type PendingAction = "checkIn" | "merch";

type GroupBlock = {
  number: number;
  leader: CheckInGuest | null;
  members: CheckInGuest[];
};

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

function matchesFilter(guest: CheckInGuest, filter: CheckInFilter): boolean {
  const isApproved = guest.approvalStatus === "approved";
  const isCheckedIn = Boolean(guest.checkedInAt);
  const hasMerch = Boolean(guest.merchReceivedAt);

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
    case "groups":
      return isApproved && guest.groupNumber != null;
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
  { id: "groups", label: "Groups" },
  { id: "all", label: "All guests" },
];

function mergeGuests(prev: CheckInGuest[], updated: CheckInGuest[]): CheckInGuest[] {
  const byId = new Map(prev.map((guest) => [guest.id, guest]));
  for (const guest of updated) {
    byId.set(guest.id, guest);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function groupTitle(group: GroupBlock): string {
  return raceTeamLabel(group.leader?.name);
}

function buildGroupLeaderNames(guests: CheckInGuest[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const guest of guests) {
    if (guest.amazingRaceLeader && guest.groupNumber != null && guest.name.trim()) {
      map.set(guest.groupNumber, guest.name.trim());
    }
  }
  return map;
}

function buildGroupBlocks(guests: CheckInGuest[], query: string): GroupBlock[] {
  const byNumber = new Map<number, { leader: CheckInGuest | null; members: CheckInGuest[] }>();

  for (const guest of guests) {
    if (guest.groupNumber == null) continue;

    const block = byNumber.get(guest.groupNumber) ?? { leader: null, members: [] };
    if (guest.amazingRaceLeader) {
      block.leader = guest;
    } else {
      block.members.push(guest);
    }
    byNumber.set(guest.groupNumber, block);
  }

  return [...byNumber.entries()]
    .map(([number, block]) => ({
      number,
      leader: block.leader,
      members: block.members.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => {
      if (!query) return true;
      if (groupTitle(group).toLowerCase().includes(query)) return true;
      if (group.leader && matchesSearch(group.leader, query)) return true;
      return group.members.some((member) => matchesSearch(member, query));
    })
    .sort((a, b) => a.number - b.number);
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

  const groupStats = useMemo(() => {
    const groupNumbers = new Set(
      approvedGuests.map((guest) => guest.groupNumber).filter((n): n is number => n != null),
    );
    const groupsWithLeader = new Set<number>();

    for (const guest of approvedGuests) {
      if (guest.amazingRaceLeader && guest.groupNumber != null) {
        groupsWithLeader.add(guest.groupNumber);
      }
    }

    return {
      groupCount: groupNumbers.size,
      groupsWithoutLeader: [...groupNumbers].filter((n) => !groupsWithLeader.has(n)).length,
    };
  }, [approvedGuests]);

  const stats = useMemo(() => {
    const checkedIn = approvedGuests.filter((guest) => guest.checkedInAt).length;
    const merchReceived = approvedGuests.filter((guest) => guest.merchReceivedAt).length;

    return {
      approved: approvedGuests.length,
      checkedIn,
      merchReceived,
      groupCount: groupStats.groupCount,
      groupsWithoutLeader: groupStats.groupsWithoutLeader,
    };
  }, [approvedGuests, groupStats]);

  const visibleGuests = useMemo(
    () =>
      guests.filter(
        (guest) => matchesFilter(guest, filter) && matchesSearch(guest, query),
      ),
    [guests, filter, query],
  );

  const groupLeaderNames = useMemo(() => buildGroupLeaderNames(approvedGuests), [approvedGuests]);

  const groupBlocks = useMemo(
    () => buildGroupBlocks(approvedGuests.filter((guest) => guest.groupNumber != null), query),
    [approvedGuests, query],
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

  function guestTeamLabel(guest: CheckInGuest): string | null {
    if (guest.groupNumber == null) return null;
    const leaderName =
      guest.amazingRaceLeader && guest.name.trim()
        ? guest.name.trim()
        : groupLeaderNames.get(guest.groupNumber);
    return raceTeamLabel(leaderName);
  }

  function renderGuestRow(guest: CheckInGuest, showGroup = true) {
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
        {showGroup ? (
          <td>
            {guest.groupNumber != null ? (
              <span className="admin-checkin__badge admin-checkin__badge--race">
                {guestTeamLabel(guest)}
                {guest.amazingRaceLeader ? " · Leader" : ""}
              </span>
            ) : (
              <span className="admin-checkin__badge admin-checkin__badge--out">—</span>
            )}
          </td>
        ) : null}
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
  }

  function renderGuestTable(guestRows: CheckInGuest[], showGroup = true) {
    if (guestRows.length === 0) {
      return <p className="admin-checkin__group-empty">No guests in this section.</p>;
    }

    return (
      <div className="admin-submissions-table-wrap">
        <table className="admin-submissions-table admin-checkin__table">
          <thead>
            <tr>
              <th>Guest</th>
              {showGroup ? <th>Group</th> : null}
              <th>Arrival</th>
              <th>Merch</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>{guestRows.map((guest) => renderGuestRow(guest, showGroup))}</tbody>
        </table>
      </div>
    );
  }

  const showingGroups = filter === "groups";

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
          <span className="admin-checkin__stat-value">{stats.groupCount}</span>
          <span className="admin-checkin__stat-label">Groups</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.groupsWithoutLeader}</span>
          <span className="admin-checkin__stat-label">Groups w/o leader</span>
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
          placeholder="Search name, email, team…"
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
        {showingGroups
          ? `Showing ${groupBlocks.length} group${groupBlocks.length === 1 ? "" : "s"}`
          : `Showing ${visibleGuests.length} guest${visibleGuests.length === 1 ? "" : "s"}`}{" "}
        · groups are assigned on the Amazing Race page
      </p>

      {showingGroups ? (
        groupBlocks.length === 0 ? (
          <p className="text-sm text-[var(--color-wisp)]/60">No groups match this search.</p>
        ) : (
          <div className="admin-checkin__groups">
            {groupBlocks.map((group) => (
              <section key={group.number} className="admin-checkin__group">
                <header className="admin-checkin__group-header">
                  <h3 className="admin-checkin__group-title">{groupTitle(group)}</h3>
                  <p className="admin-checkin__group-meta">
                    {(group.leader ? 1 : 0) + group.members.length} guest
                    {(group.leader ? 1 : 0) + group.members.length === 1 ? "" : "s"}
                    {!group.leader ? " · no leader assigned" : ""}
                  </p>
                </header>

                <div className="admin-checkin__group-section">
                  <h4 className="admin-checkin__group-section-label">Leader</h4>
                  {group.leader ? (
                    renderGuestTable([group.leader], false)
                  ) : (
                    <p className="admin-checkin__group-empty">No leader assigned yet.</p>
                  )}
                </div>

                <div className="admin-checkin__group-section">
                  <h4 className="admin-checkin__group-section-label">
                    Members{group.members.length > 0 ? ` (${group.members.length})` : ""}
                  </h4>
                  {renderGuestTable(group.members, false)}
                </div>
              </section>
            ))}
          </div>
        )
      ) : visibleGuests.length === 0 ? (
        <p className="text-sm text-[var(--color-wisp)]/60">No guests match this filter.</p>
      ) : (
        renderGuestTable(visibleGuests)
      )}
    </div>
  );
}
