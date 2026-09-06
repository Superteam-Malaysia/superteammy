"use client";

import { useRouter } from "next/navigation";
import { CtaButton } from "@borneo/components/ui";
import { clearStoredDeviceToken } from "@borneo/components/auth/SessionPersistence";
import { withBasePath } from "@borneo/lib/base-path";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    clearStoredDeviceToken();
    router.push(withBasePath("/login"));
    router.refresh();
  }

  return (
    <CtaButton variant="ghost-wisp" size="sm" showArrow={false} onClick={() => void logout()}>
      Sign out
    </CtaButton>
  );
}
