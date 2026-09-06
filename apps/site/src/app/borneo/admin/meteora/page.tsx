import type { Metadata } from "next";
import { AdminMeteoraExportButton } from "@borneo/components/admin/AdminMeteoraExportButton";
import { AdminMeteoraWalletsTable } from "@borneo/components/admin/AdminMeteoraWalletsTable";
import { PageHeader } from "@borneo/components/shell";
import { SectionArticle, SectionIntro } from "@borneo/components/ui";
import { listMeteoraWalletsForAdmin } from "@borneo/lib/meteora/admin-wallets";

export const metadata: Metadata = {
  title: "Meteora wallets · Admin",
  description: "Locked-in Solana wallets for the Meteora trading challenge.",
};

export const dynamic = "force-dynamic";

export default async function AdminMeteoraPage() {
  const rows = await listMeteoraWalletsForAdmin();

  return (
    <main className="site-main site-main--stack">
      <PageHeader
        title="Meteora wallets"
        lead="One-time lock-in addresses from the Meteora challenge page — read-only for prize tracking."
      />

      <SectionArticle className="border border-[color:var(--color-transparent-wisp-10)] p-6 md:p-8">
        <SectionIntro
          title={`${rows.length} wallet${rows.length === 1 ? "" : "s"} locked in`}
          accent="byte"
        />
        <p className="mt-2 text-sm text-[color:var(--color-transparent-wisp-55)]">
          Sorted by most recently updated. Wallets cannot be changed after submit.
        </p>
        <div className="mt-6">
          <AdminMeteoraExportButton />
        </div>
        <div className="mt-8">
          <AdminMeteoraWalletsTable />
        </div>
      </SectionArticle>
    </main>
  );
}
