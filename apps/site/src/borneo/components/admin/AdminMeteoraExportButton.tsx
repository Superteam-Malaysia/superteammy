"use client";

import { useState } from "react";
import { withBasePath } from "@borneo/lib/base-path";

export function AdminMeteoraExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportCsv() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(withBasePath("/api/admin/meteora/wallets/export"), {
        credentials: "same-origin",
      });

      if (!res.ok) {
        setError("Export failed. Try again in a moment.");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "meteora-wallets.csv";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-meteora-export">
      <button
        type="button"
        className="cta cta--ghost-wisp cta--sm"
        disabled={loading}
        onClick={() => void exportCsv()}
      >
        {loading ? "Fetching live balances…" : "Export CSV"}
      </button>
      {error ? <p className="admin-meteora-export__error">{error}</p> : null}
    </div>
  );
}
