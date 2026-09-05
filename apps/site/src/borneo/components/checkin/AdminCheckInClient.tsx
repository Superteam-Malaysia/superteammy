"use client";

import { useMemo, useState } from "react";
import type { CheckInGuest } from "@borneo/lib/checkin/admin";
import { withBasePath } from "@borneo/lib/base-path";

type CheckInFilter = "approved" | "checked-in" | "not-checked-in" | "all";

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
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function matchesFilter(guest: CheckInGuest, filter: CheckInFilter): boolean {
  const isApproved = guest.approvalStatus === "approved";
  const isCheckedIn = Boolean(guest.checkedInAt);

  switch (filter) {
    case "approved":
      return isApproved;
    case "checked-in":
      return isApproved && isCheckedIn;
    case "not-checked-in":
      return isApproved && !isCheckedIn;
    case "all":
      return true;
  }
}

const FILTERS: { id: CheckInFilter; label: string }[] = [
  { id: "approved", label: "Approved" },
  { id: "not-checked-in", label: "Not checked in" },
  { id: "checked-in", label: "Checked in" },
  { id: "all", label: "All guests" },
];

export function AdminCheckInClient({ initialGuests }: { initialGuests: CheckInGuest[] }) {
  const [guests, setGuests] = useState(initialGuests);
  const [filter, setFilter] = useState<CheckInFilter>("approved");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  const approvedGuests = useMemo(
    () => guests.filter((guest) => guest.approvalStatus === "approved"),
    [guests],
  );

  const stats = useMemo(() => {
    const checkedIn = approvedGuests.filter((guest) => guest.checkedInAt).length;
    return {
      approved: approvedGuests.length,
      checkedIn,
      notCheckedIn: approvedGuests.length - checkedIn,
    };
  }, [approvedGuests]);

  const visibleGuests = useMemo(
    () => guests.filter((guest) => matchesFilter(guest, filter) && matchesSearch(guest, query)),
    [guests, filter, query],
  );

  async function toggleCheckIn(guest: CheckInGuest) {
    const nextCheckedIn = !guest.checkedInAt;
    setPendingId(guest.id);
    setError(null);

    try {
      const res = await fetch(withBasePath("/api/admin/checkin"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: guest.id, checkedIn: nextCheckedIn }),
      });
      const data = (await res.json()) as { error?: string; guest?: CheckInGuest };

      if (!res.ok || !data.guest) {
        setError(data.error ?? "Could not update check-in.");
        return;
      }

      setGuests((prev) => prev.map((row) => (row.id === data.guest!.id ? data.guest! : row)));
    } catch {
      setError("Could not update check-in.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="admin-checkin">
      <div className="admin-checkin__stats">
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.checkedIn}</span>
          <span className="admin-checkin__stat-label">Checked in</span>
        </div>
        <div className="admin-checkin__stat">
          <span className="admin-checkin__stat-value">{stats.notCheckedIn}</span>
          <span className="admin-checkin__stat-label">Still expected</span>
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
          placeholder="Search name, email, Telegram…"
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
        Showing {visibleGuests.length} guest{visibleGuests.length === 1 ? "" : "s"}
      </p>

      {visibleGuests.length === 0 ? (
        <p className="text-sm text-[var(--color-wisp)]/60">No guests match this filter.</p>
      ) : (
        <div className="admin-submissions-table-wrap">
          <table className="admin-submissions-table admin-checkin__table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Ticket</th>
                <th>Status</th>
                <th>Check-in</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleGuests.map((guest) => {
                const checkedIn = Boolean(guest.checkedInAt);
                const isPending = pendingId === guest.id;

                return (
                  <tr key={guest.id} className={checkedIn ? "admin-checkin__row--done" : undefined}>
                    <td>
                      <span className="admin-checkin__name">{guest.name}</span>
                      <span className="admin-submissions-table__email">{guest.email}</span>
                      {guest.telegram ? (
                        <span className="admin-submissions-table__email">{guest.telegram}</span>
                      ) : null}
                    </td>
                    <td>{guest.ticketName ?? "—"}</td>
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
                      {guest.approvalStatus !== "approved" ? (
                        <span className="admin-checkin__approval">{guest.approvalStatus ?? "unknown"}</span>
                      ) : null}
                    </td>
                    <td className="admin-submissions-table__when">
                      {guest.checkedInAt ? formatWhen(guest.checkedInAt) : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          checkedIn
                            ? "admin-checkin__action admin-checkin__action--undo"
                            : "admin-checkin__action admin-checkin__action--check"
                        }
                        disabled={isPending}
                        onClick={() => void toggleCheckIn(guest)}
                      >
                        {isPending ? "Saving…" : checkedIn ? "Undo" : "Check in"}
                      </button>
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
