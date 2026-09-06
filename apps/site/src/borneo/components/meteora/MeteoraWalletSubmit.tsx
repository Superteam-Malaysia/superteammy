"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "@borneo/components/Link";
import { withBasePath } from "@borneo/lib/base-path";
import type { WalletBalances } from "@borneo/lib/solana/wallet-balances";

type MeteoraWalletSubmitProps = {
  signedIn: boolean;
  initialWallet: string;
  initialLocked: boolean;
  initialBalances: WalletBalances | null;
};

type WalletApiState = {
  solanaWallet: string | null;
  locked: boolean;
  balances: WalletBalances | null;
};

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function MeteoraWalletSubmit({
  signedIn,
  initialWallet,
  initialLocked,
  initialBalances,
}: MeteoraWalletSubmitProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [locked, setLocked] = useState(initialLocked);
  const [balances, setBalances] = useState<WalletBalances | null>(initialBalances);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!signedIn || !locked) return;
    setLoadingBalances(true);
    setError(null);

    const res = await fetch(withBasePath("/api/meteora/wallet"), { cache: "no-store" });
    const data = (await res.json()) as WalletApiState & { error?: string };

    setLoadingBalances(false);
    if (!res.ok) {
      setError(data.error ?? "Could not load wallet balances.");
      return;
    }

    if (data.solanaWallet) setWallet(data.solanaWallet);
    setBalances(data.balances);
  }, [signedIn, locked]);

  useEffect(() => {
    if (signedIn && locked && !initialBalances) {
      void refreshBalances();
    }
  }, [signedIn, locked, initialBalances, refreshBalances]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn || locked) return;

    setSaving(true);
    setError(null);

    const res = await fetch(withBasePath("/api/meteora/wallet"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solanaWallet: wallet }),
    });

    const data = (await res.json()) as WalletApiState & { error?: string };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save wallet.");
      if (data.locked && data.solanaWallet) {
        setWallet(data.solanaWallet);
        setLocked(true);
      }
      return;
    }

    if (data.solanaWallet) setWallet(data.solanaWallet);
    setLocked(true);
    setBalances(data.balances ?? null);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={[
        "meteora-wallet",
        signedIn ? "meteora-wallet--active" : "meteora-wallet--locked",
        locked ? "meteora-wallet--submitted" : "",
      ].join(" ")}
      aria-disabled={!signedIn}
    >
      <div className="meteora-wallet__head">
        <h2 className="meteora-wallet__title">
          {locked ? "Wallet locked in" : "Submit your wallet"}
        </h2>
        <p className="meteora-wallet__lead">
          {locked
            ? "This address is registered for the Meteora challenge and cannot be changed."
            : signedIn
              ? "Use the Solana address you’ll trade with on Meteora — you can only submit once."
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

      <label className="meteora-wallet__field">
        <span className="meteora-wallet__label">Solana wallet</span>
        <input
          type="text"
          value={wallet}
          onChange={(e) => {
            if (locked) return;
            setWallet(e.target.value);
          }}
          disabled={!signedIn || locked}
          readOnly={!signedIn || locked}
          autoComplete="off"
          spellCheck={false}
          className="meteora-wallet__input"
          placeholder="Phantom / Solflare address (base58)"
        />
      </label>

      {locked && wallet ? (
        <section className="meteora-wallet__balances" aria-labelledby="meteora-wallet-balances">
          <div className="meteora-wallet__balances-head">
            <h3 id="meteora-wallet-balances" className="meteora-wallet__balances-title">
              Balances · {shortAddress(wallet)}
            </h3>
            <button
              type="button"
              onClick={() => void refreshBalances()}
              disabled={loadingBalances}
              className="meteora-wallet__refresh"
            >
              {loadingBalances ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {balances?.balances.length ? (
            <ul className="meteora-wallet__balance-list">
              {balances.balances.map((row) => (
                <li key={`${row.mint ?? "sol"}-${row.symbol}`} className="meteora-wallet__balance-row">
                  <div className="meteora-wallet__balance-meta">
                    {row.logoUrl ? (
                      <img
                        src={row.logoUrl}
                        alt=""
                        width={28}
                        height={28}
                        className="meteora-wallet__balance-icon"
                      />
                    ) : (
                      <span className="meteora-wallet__balance-icon meteora-wallet__balance-icon--fallback" aria-hidden />
                    )}
                    <div className="meteora-wallet__balance-labels">
                      <span className="meteora-wallet__balance-name">{row.name}</span>
                      <span className="meteora-wallet__balance-symbol">{row.symbol}</span>
                    </div>
                  </div>
                  <div className="meteora-wallet__balance-values">
                    <span className="meteora-wallet__balance-amount">{row.amount}</span>
                    {row.valueUsd ? (
                      <span className="meteora-wallet__balance-usd">{row.valueUsd}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {!locked ? (
        <button
          type="submit"
          disabled={!signedIn || saving}
          className="cta cta--byte cta--md meteora-wallet__submit disabled:opacity-40"
        >
          {saving ? "Locking in…" : "Lock in wallet"}
        </button>
      ) : null}
    </form>
  );
}
