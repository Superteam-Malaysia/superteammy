import type { Metadata } from "next";
import { AdminNav } from "@borneo/components/admin/AdminNav";
import { requireOrganizerPage } from "@borneo/lib/auth/require-organizer-page";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireOrganizerPage();

  return (
    <div className="admin-shell">
      <AdminNav />
      {children}
    </div>
  );
}
