import Link from "@borneo/components/Link";
import { withBasePath } from "@borneo/lib/base-path";

export function ProfileAdminLinks() {
  return (
    <nav className="profile-admin-links" aria-label="Organizer tools">
      <Link
        href={withBasePath("/admin/checkin")}
        className="text-link-wisp font-[family-name:var(--font-mono)] text-sm"
      >
        Guest check-in →
      </Link>
      <span className="profile-admin-links__sep" aria-hidden>
        ·
      </span>
      <Link
        href={withBasePath("/admin/submissions")}
        className="text-link-wisp font-[family-name:var(--font-mono)] text-sm"
      >
        Review all submissions →
      </Link>
    </nav>
  );
}
