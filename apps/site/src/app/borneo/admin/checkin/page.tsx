import type { Metadata } from "next";
import Link from "@borneo/components/Link";
import { notFound } from "next/navigation";
import { AdminCheckInClient } from "@borneo/components/checkin/AdminCheckInClient";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import { listGuestsForCheckIn } from "@borneo/lib/checkin/admin";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata: Metadata = {
  title: "Guest check-in · Admin",
  description: "Track Startup Village Borneo guest check-in for organizers.",
};

export const dynamic = "force-dynamic";

export default async function AdminCheckInPage() {
  const participant = await getParticipantForSession();
  if (!participant || !isOrganizer(participant)) notFound();

  const guests = await listGuestsForCheckIn();
  const approved = guests.filter((guest) => guest.approvalStatus === "approved");
  const checkedIn = approved.filter((guest) => guest.checkedInAt).length;
  const merchReceived = approved.filter((guest) => guest.merchReceivedAt).length;

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Guest check-in"
        lead="Mark arrivals and merch pickup on-site. Only organizers can view this page."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro
          title={`${checkedIn} / ${approved.length} checked in · ${merchReceived} / ${approved.length} merch received`}
          lead="Search by name or email. Tap Check in at the door and Merch received at the merch desk. Undo if you made a mistake."
        />
        <p className="admin-checkin__links">
          <Link href={withBasePath("/admin/submissions")} className="admin-checkin__link">
            Race submissions →
          </Link>
        </p>
        <div className="mt-8">
          <AdminCheckInClient initialGuests={guests} />
        </div>
      </SectionArticle>
    </main>
  );
}
