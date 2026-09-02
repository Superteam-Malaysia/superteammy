/**
 * Meteora trading challenge — copy from the event poster (Startup Village Borneo).
 */
export const METEORA_CHALLENGE = {
  dayLabel: "Day 2 — Sunday 8 September",
  title: "Win 1 $SOL on Meteora",
  subtitle: "3 steps",
  prize: "1 SOL",
  deposit: "$25",
  match: "$25",
  cutoff: "Sept 8 · 8pm MYT",
  workshop: "11:45–12:30 · Vesper · Meteora Ecosystem",
  steps: [
    {
      n: "01",
      title: "Learn how to use Meteora",
      detail: "Did you listen to Vesper? ;)",
    },
    {
      n: "02",
      title: "You put $25, we match $25",
      detail: "Meteora and Superteam MY will match your $25.",
      cue: "You start →",
    },
    {
      n: "03",
      title: "Best PnL wins!",
      detail: "At Sept 8, 8pm, the person with the best PnL will win 1 $SOL.",
      cue: "← You win!",
    },
  ],
} as const;
