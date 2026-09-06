"use client";

import { useCallback, useState } from "react";

type CopyWalletButtonProps = {
  address: string;
};

export function CopyWalletButton({ address }: CopyWalletButtonProps) {
  const [hint, setHint] = useState<string | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setHint("Copied");
    } catch {
      setHint("Copy failed");
    }

    window.setTimeout(() => setHint(null), 1600);
  }, [address]);

  return (
    <span className="admin-meteora-wallet-copy">
      <button
        type="button"
        className="admin-meteora-wallet-copy__btn"
        onClick={() => void copy()}
        aria-label={`Copy wallet ${address}`}
        title="Copy full address"
      >
        Copy
      </button>
      {hint ? <span className="admin-meteora-wallet-copy__hint">{hint}</span> : null}
    </span>
  );
}
