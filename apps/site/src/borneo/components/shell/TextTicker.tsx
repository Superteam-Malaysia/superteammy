const TICKER_TEXT = "STARTUP VILLAGE BORNEO · KUCHING · 5–9 SEPT 2026 · BUILD · RACE · DEMO DAY · ";

export function TextTicker() {
  return (
    <div
      className="overflow-hidden border-b border-[color:var(--color-transparent-wisp-10)] py-2"
      aria-hidden="true"
    >
      <div className="ticker-track font-[family-name:var(--font-scramble)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-wisp)]/70">
        {TICKER_TEXT.repeat(4)}
      </div>
    </div>
  );
}
