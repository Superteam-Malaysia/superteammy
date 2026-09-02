"use client";

import { FormEvent, useState } from "react";
import Link from "@borneo/components/Link";
import { withBasePath } from "@borneo/lib/base-path";

type MeteoraWalletSubmitProps = {
  signedIn: boolean;
  initialWallet: string;
};

export function MeteoraWalletSubmit({ signedIn, initialWallet }: MeteoraWalletSubmitProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch(withBasePath("/api/meteora/wallet"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solanaWallet: wallet }),
    });

    const data = (await res.json()) as { error?: string; solanaWallet?: string };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save wallet.");
      return;
    }

    if (data.solanaWallet) setWallet(data.solanaWallet);
    setSaved(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        "meteora-wallet",
        signedIn ? "meteora-wallet--active" : "meteora-wallet--locked",
      ].join(" ")}
      aria-disabled={!signedIn}
    >
      <div className="meteora-wallet__head">
        <h2 className="meteora-wallet__title">Submit your wallet</h2>
        <p className="meteora-wallet__lead">
          {signedIn
            ? "Use the Solana address you’ll trade with on Meteora — prize payouts go here."
            : "Sign in to register your wallet for the challenge."}
        </p>
      </div>

      {!signedIn ? (
        <p className="meteora-wallet__sign-in-hint">
          <Link href="/login" className="meteora-wallet__sign-in-link">
            Sign in to submit
          </Link>
        </p>
      ) : null}

      {error ? <p className="meteora-wallet__error">{error}</p> : null}
      {saved ? <p className="meteora-wallet__saved">Wallet saved.</p> : null}

      <label className="meteora-wallet__field">
        <span className="meteora-wallet__label">Solana wallet</span>
        <input
          type="text"
          value={wallet}
          onChange={(e) => {
            setWallet(e.target.value);
            setSaved(false);
          }}
          disabled={!signedIn}
          readOnly={!signedIn}
          autoComplete="off"
          spellCheck={false}
          className="meteora-wallet__input"
          placeholder="Phantom / Solflare address (base58)"
        />
      </label>

      <button
        type="submit"
        disabled={!signedIn || saving}
        className="cta cta--byte cta--md meteora-wallet__submit disabled:opacity-40"
      >
        {saving ? "Submitting…" : "Submit wallet"}
      </button>
    </form>
  );
}
