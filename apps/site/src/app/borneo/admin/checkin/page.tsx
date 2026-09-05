import type { Metadata } from "next";
import Link from "@borneo/components/Link";
import { notFound } from "next/navigation";
import { AdminCheckInClient } from "@borneo/components/checkin/AdminCheckInClient";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { isOrganizer } from "@borneo/lib/auth/organizer";
import { listGuestsForCheckIn, listRaceTeams } from "@borneo/lib/checkin/admin";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata: Metadata = {
  title: "Guest check-in · Admin",
  description: "Track Startup Village Borneo guest check-in for organizers.",
};

export const dynamic = "force-dynamic";

export default async function AdminCheckInPage() {
  const participant = await getParticipantForSession();
  if (!participant || !isOrganizer(participant)) notFound();

  const [guests, raceTeams] = await Promise.all([listGuestsForCheckIn(), listRaceTeams()]);
  const approved = guests.filter((guest) => guest.approvalStatus === "approved");
  const checkedIn = approved.filter((guest) => guest.checkedInAt).length;
  const merchReceived = approved.filter((guest) => guest.merchReceivedAt).length;
  const raceLeaders = approved.filter((guest) => guest.amazingRaceLeader).length;

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Guest check-in"
        lead="Mark arrivals, merch pickup, and Amazing Race teams on-site. Separate from hackathon teams in Teams & Mentors."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro
          title={`${checkedIn} / ${approved.length} checked in · ${merchReceived} / ${approved.length} merch · ${raceLeaders} race leaders`}
          lead="Create Amazing Race teams here, assign guests, then mark one leader per race team. Hackathon project teams on /teams are unrelated."
        />
        <p className="admin-checkin__links">
          <Link href={withBasePath("/admin/submissions")} className="admin-checkin__link">
            Race submissions →
          </Link>
        </p>
        <div className="mt-8">
          <AdminCheckInClient initialGuests={guests} initialRaceTeams={raceTeams} />
        </div>
      </SectionArticle>
    </main>
  );
}
