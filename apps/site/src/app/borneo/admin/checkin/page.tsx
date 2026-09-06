import type { Metadata } from "next";
import { AdminCheckInClient } from "@borneo/components/checkin/AdminCheckInClient";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { listGuestsForCheckIn } from "@borneo/lib/checkin/admin";

export const metadata: Metadata = {
  title: "Guest check-in · Admin",
  description: "Organizer-only on-site check-in desk.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCheckInPage() {
  const guests = await listGuestsForCheckIn();
  const approved = guests.filter((guest) => guest.approvalStatus === "approved");
  const checkedIn = approved.filter((guest) => guest.checkedInAt).length;
  const merchReceived = approved.filter((guest) => guest.merchReceivedAt).length;
  const raceLeaders = approved.filter((guest) => guest.amazingRaceLeader).length;

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Guest check-in"
        lead="Check-in and merch only — Amazing Race groups are assigned on the race page."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro
          title={`${checkedIn} / ${approved.length} checked in · ${merchReceived} / ${approved.length} merch · ${raceLeaders} group leaders`}
          lead="Group numbers are read-only here. Participants pick groups on /amazing-race (max 4 per group)."
        />
        <div className="mt-8">
          <AdminCheckInClient initialGuests={guests} />
        </div>
      </SectionArticle>
    </main>
  );
}
