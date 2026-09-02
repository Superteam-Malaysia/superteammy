import { MeteoraWalletSubmit } from "@borneo/components/meteora/MeteoraWalletSubmit";
import { METEORA_CHALLENGE } from "@borneo/data/meteora-challenge";
import { getParticipantForSession } from "@borneo/lib/auth/participant";
import { pageMetadata } from "@borneo/lib/metadata";
import { withBasePath } from "@borneo/lib/base-path";

export const metadata = pageMetadata({
  title: "Meteora challenge",
  description:
    "Win 1 SOL on Meteora at Startup Village Borneo — $25 match, best PnL wins. Register your wallet to compete.",
  path: "/meteora",
});

export const dynamic = "force-dynamic";

export default async function MeteoraPage() {
  const participant = await getParticipantForSession();
  const signedIn = Boolean(participant);
  const initialWallet = participant?.solanaWallet?.trim() ?? "";

  return (
    <main className="site-main meteora-page">
      <header className="meteora-hero">
        <div className="meteora-hero__inner">
          <p className="meteora-hero__day">{METEORA_CHALLENGE.dayLabel}</p>
          <h1 className="meteora-hero__title">{METEORA_CHALLENGE.title}</h1>
          <p className="meteora-hero__subtitle">{METEORA_CHALLENGE.subtitle}</p>
          <p className="meteora-hero__workshop">{METEORA_CHALLENGE.workshop}</p>

          <div className="meteora-hero__stats">
            <div className="meteora-hero__stat">
              <span className="meteora-hero__stat-value">{METEORA_CHALLENGE.prize}</span>
              <span className="meteora-hero__stat-label">Grand prize</span>
            </div>
            <div className="meteora-hero__stat">
              <span className="meteora-hero__stat-value">{METEORA_CHALLENGE.deposit}</span>
              <span className="meteora-hero__stat-label">You deposit</span>
            </div>
            <div className="meteora-hero__stat">
              <span className="meteora-hero__stat-value">{METEORA_CHALLENGE.match}</span>
              <span className="meteora-hero__stat-label">We match</span>
            </div>
            <div className="meteora-hero__stat">
              <span className="meteora-hero__stat-value">{METEORA_CHALLENGE.cutoff}</span>
              <span className="meteora-hero__stat-label">Winner at</span>
            </div>
          </div>

          <img
            src={withBasePath("/partners/meteora.svg")}
            alt="Meteora"
            className="meteora-hero__logo"
            width={120}
            height={32}
          />
        </div>
      </header>

      <section className="meteora-steps" aria-labelledby="meteora-steps-heading">
        <h2 id="meteora-steps-heading" className="sr-only">
          How it works
        </h2>
        <ol className="meteora-steps__list">
          {METEORA_CHALLENGE.steps.map((step) => (
            <li key={step.n} className="meteora-steps__item">
              <span className="meteora-steps__n">Step {step.n}</span>
              {"cue" in step && step.cue ? (
                <span className="meteora-steps__cue">{step.cue}</span>
              ) : null}
              <p className="meteora-steps__title">{step.title}</p>
              <p className="meteora-steps__detail">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="meteora-wallet-wrap">
        <MeteoraWalletSubmit signedIn={signedIn} initialWallet={initialWallet} />
      </div>
    </main>
  );
}
