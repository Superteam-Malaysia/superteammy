import type { PrizeRow } from "@borneo/types/event";
import { METEORA_CHALLENGE } from "./meteora-challenge";
import { REDOTPAY_QUIZ } from "./redotpay-quiz";

export const PRIZE_TOTAL = "$10,000";

/** USD allocations from the official SVB prize pool. */
export const PRIZE_POOL_ROWS: PrizeRow[] = [
  { label: "1st place", amount: "$3,000" },
  { label: "2nd place", amount: "$2,000" },
  { label: "3rd place", amount: "$1,000" },
  { label: "Honourable mentions (2 × $500)", amount: "$1,000" },
  { label: "Sustainability track (2 × $500)", amount: "$1,000", note: "Criteria announced Day 2" },
  { label: "Content prizes (10 × $100)", amount: "$1,000", note: "Judged after event" },
  { label: "Amazing Race (2 × $500)", amount: "$1,000" },
];

/** Partner-funded prizes on top of the USD pool. */
export const PARTNER_PRIZE_ROWS: PrizeRow[] = [
  {
    label: "Meteora challenge (best PnL)",
    amount: METEORA_CHALLENGE.prize,
    note: `$${METEORA_CHALLENGE.deposit.replace("$", "")} match · partner prize`,
  },
  {
    label: "RedotPay Card Quiz",
    amount: REDOTPAY_QUIZ.prize,
    note: `${REDOTPAY_QUIZ.dailyWinnerCount} winners/day · partner prize`,
  },
];

export const PRIZE_ROWS: PrizeRow[] = [...PRIZE_POOL_ROWS, ...PARTNER_PRIZE_ROWS];
