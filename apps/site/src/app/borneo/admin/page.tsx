import type { Metadata } from "next";
import Link from "@borneo/components/Link";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle } from "@borneo/components/ui";
import { getAdminHubStats } from "@borneo/lib/admin/hub-stats";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata: Metadata = {
  title: "Organizer admin",
  description: "Startup Village Borneo organizer dashboards.",
};

export const dynamic = "force-dynamic";

const DASHBOARDS = [
  {
    href: "/admin/checkin",
    title: "Guest check-in",
    description: "On-site check-in, merch pickup, and race group overview.",
    statKey: "checkIn" as const,
  },
  {
    href: "/admin/submissions",
    title: "Amazing Race",
    description: "Team leaderboard and thread URLs submitted for race stations.",
    statKey: "raceSubmissions" as const,
  },
  {
    href: "/admin/redotpay",
    title: "RedotPay quiz",
    description: "Internal leaderboard for the timed partner quiz.",
    statKey: "redotPayQuizCompleted" as const,
  },
  {
    href: "/admin/meteora",
    title: "Meteora wallets",
    description: "Locked-in Solana addresses for the trading challenge.",
    statKey: "meteoraWallets" as const,
  },
];

function statLabel(key: (typeof DASHBOARDS)[number]["statKey"], stats: Awaited<ReturnType<typeof getAdminHubStats>>): string {
  switch (key) {
    case "checkIn":
      return `${stats.checkIn.checkedIn}/${stats.checkIn.approved} checked in · ${stats.checkIn.merchReceived} merch`;
    case "raceSubmissions":
      return `${stats.raceSubmissions} submission${stats.raceSubmissions === 1 ? "" : "s"}`;
    case "redotPayQuizCompleted":
      return `${stats.redotPayQuizCompleted} completed`;
    case "meteoraWallets":
      return `${stats.meteoraWallets} wallet${stats.meteoraWallets === 1 ? "" : "s"}`;
  }
}

export default async function AdminHubPage() {
  const stats = await getAdminHubStats();

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Organizer admin"
        lead="Semi, Han, and Marianne — dashboards for check-in, race, RedotPay quiz, and Meteora wallets."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <ul className="admin-hub__grid">
          {DASHBOARDS.map((item) => (
            <li key={item.href}>
              <Link href={withBasePath(item.href)} className="admin-hub__card">
                <span className="admin-hub__card-stat">{statLabel(item.statKey, stats)}</span>
                <span className="admin-hub__card-title">{item.title}</span>
                <span className="admin-hub__card-desc">{item.description}</span>
                <span className="admin-hub__card-cta">Open dashboard →</span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionArticle>
    </main>
  );
}
