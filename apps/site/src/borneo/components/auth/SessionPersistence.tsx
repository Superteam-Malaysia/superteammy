"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@borneo/lib/base-path";
import { DEVICE_TOKEN_STORAGE_KEY } from "@borneo/lib/auth/device-token-client";

function saveDeviceToken(token: string) {
  try {
    localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
  } catch {
    /* private mode / storage full */
  }
}

function readDeviceToken(): string | null {
  try {
    return localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredDeviceToken() {
  try {
    localStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Restore httpOnly session from localStorage device token; seed token from URL after bot login. */
export function SessionPersistence() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const params = new URLSearchParams(window.location.search);
      const seed = params.get("device_seed")?.trim();
      if (seed) {
        saveDeviceToken(seed);
        params.delete("device_seed");
        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", nextUrl);
      }

      try {
        const meRes = await fetch(withBasePath("/api/auth/me"), { credentials: "same-origin" });
        if (meRes.ok) return;

        const stored = readDeviceToken();
        if (!stored) return;

        const restoreRes = await fetch(withBasePath("/api/auth/device/restore"), {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: stored }),
        });

        if (!cancelled && restoreRes.ok) {
          router.refresh();
        }
      } catch {
        /* offline / transient */
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}

export function persistDeviceToken(token: string | undefined) {
  if (!token) return;
  saveDeviceToken(token);
}
