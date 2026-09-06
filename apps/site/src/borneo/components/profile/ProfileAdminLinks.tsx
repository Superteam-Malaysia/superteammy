import Link from "@borneo/components/Link";
import { withBasePath } from "@borneo/lib/base-path";

export function ProfileAdminLinks() {
  return (
    <nav className="profile-admin-links" aria-label="Organizer tools">
      <Link
        href={withBasePath("/admin")}
        className="text-link-wisp font-[family-name:var(--font-mono)] text-sm"
      >
        Organizer admin →
      </Link>
    </nav>
  );
}
