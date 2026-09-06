import type { Metadata } from "next";
import { RedotPayQuizLeaderboard } from "@borneo/components/redotpay/RedotPayQuizLeaderboard";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle } from "@borneo/components/ui";

export const metadata: Metadata = {
  title: "RedotPay quiz · Admin",
  description: "Internal RedotPay quiz leaderboard for organizers.",
};

export const dynamic = "force-dynamic";

export default function AdminRedotPayPage() {
  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="RedotPay quiz"
        lead="Staff leaderboard — ranked by score, then fastest finish."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <RedotPayQuizLeaderboard />
      </SectionArticle>
    </main>
  );
}
