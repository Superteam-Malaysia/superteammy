/**
 * RedotPay Card Quiz — sourced from partner deck (10 questions).
 * @see https://docs.google.com/presentation/d/1a6z7QWDcn52WVqywNb7D-NQ0pRBLrcPXOVeAEw_Nhm8
 */

export type RedotPayQuizOption = {
  id: string;
  label: string;
};

export type RedotPayQuizQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: RedotPayQuizOption[];
  /** Single-select or multi-select. */
  kind: "single" | "multi";
  correct: string[];
};

export const REDOTPAY_QUIZ = {
  title: "RedotPay Card Quiz",
  prize: "RedotPay luggage tags",
  questionsPerDay: 2,
  /** First N correct answers each day (MYT) win a luggage tag — one per participant per day. */
  dailyWinnerCount: 5,
  /** First calendar day questions unlock — SVB Day 1 (MYT). */
  startDate: "2026-09-05",
  timezone: "Asia/Kuching",
  intro:
    "Two new card questions drop each day of Startup Village Borneo. Be among the first to answer correctly and claim a RedotPay luggage tag.",
} as const;

export const REDOTPAY_QUIZ_QUESTIONS: RedotPayQuizQuestion[] = [
  {
    id: "q1",
    number: 1,
    kind: "single",
    prompt: "Identify the correct statement of virtual/physical cards:",
    options: [
      { id: "A", label: "Only physical cards support online payment" },
      { id: "B", label: "Virtual cards support NFC offline payment" },
      { id: "C", label: "Virtual cards also come with physical cards" },
      { id: "D", label: "Virtual cards support ATM cash withdrawal" },
    ],
    correct: ["B"],
  },
  {
    id: "q2",
    number: 2,
    kind: "single",
    prompt: "Which of the following is available for BOTH virtual and physical cards?",
    options: [
      { id: "A", label: "Report lost card" },
      { id: "B", label: "Correction" },
      { id: "C", label: "PIN code setting" },
      { id: "D", label: "Link card to e-wallet" },
    ],
    correct: ["D"],
  },
  {
    id: "q3",
    number: 3,
    kind: "single",
    prompt:
      "The first 6–8 digits of the card number (BIN number) and its main function is:",
    options: [
      { id: "A", label: "Identify user official legal name" },
      { id: "B", label: "Identify card issuers and card organization" },
      { id: "C", label: "Provide security code for transaction verification" },
      { id: "D", label: "Determine validity period of the card" },
    ],
    correct: ["B"],
  },
  {
    id: "q4",
    number: 4,
    kind: "single",
    prompt: "When a physical card is lost, which of the following statement is correct:",
    options: [
      { id: "A", label: "Users can make a report in the app directly" },
      {
        id: "B",
        label: "The report is done by Support team, and card is not available during this period",
      },
      { id: "C", label: "After a report, the card's status is 'Frozen'" },
      { id: "D", label: "Report is irreversible. Once reported, it can only be cancelled" },
    ],
    correct: ["A"],
  },
  {
    id: "q5",
    number: 5,
    kind: "single",
    prompt: "Which of the following action can ONLY be done by RedotPay team?",
    options: [
      { id: "A", label: "Set spending limits on cards" },
      { id: "B", label: "Activate ATM function of physical card" },
      { id: "C", label: "Cancel card lost report of physical card" },
      { id: "D", label: "Modify card PIN code" },
    ],
    correct: ["C"],
  },
  {
    id: "q6",
    number: 6,
    kind: "single",
    prompt: "Which of the following is INCORRECT? Your card is temporarily locked, because you:",
    options: [
      { id: "A", label: "Entered the wrong PIN multiple times" },
      { id: "B", label: "Entered the wrong card CVV multiple times" },
      { id: "C", label: "Entered wrong card valid period multiple times" },
      { id: "D", label: "Checked card information multiple times" },
    ],
    correct: ["D"],
  },
  {
    id: "q7",
    number: 7,
    kind: "multi",
    prompt: "When a user links their card, they need to provide below information. (More than 1 answer)",
    options: [
      { id: "A", label: "Complete card number" },
      { id: "B", label: "Selected currency" },
      { id: "C", label: "Card organization" },
      { id: "D", label: "CVV" },
      { id: "E", label: "Valid period" },
      { id: "F", label: "Cardholder's name" },
    ],
    correct: ["A", "D", "E", "F"],
  },
  {
    id: "q8",
    number: 8,
    kind: "multi",
    prompt:
      "You have sufficient crypto in your account but your transaction payment failed. Which are the possible reasons? (More than 1 answer)",
    options: [
      { id: "A", label: "Insufficient amount" },
      { id: "B", label: "User disabled account" },
      { id: "C", label: "User linked card with wrong information" },
      { id: "D", label: "Merchants do not support crypto" },
      { id: "E", label: "Priority account balance is insufficient" },
    ],
    correct: ["B", "E"],
  },
  {
    id: "q9",
    number: 9,
    kind: "multi",
    prompt:
      "What can lead to restricted payment or failure to link your card at merchants/online stores? (More than 1 answer)",
    options: [
      { id: "A", label: "Merchants do not support virtual or international cards" },
      { id: "B", label: "Merchants risk control strategy" },
      { id: "C", label: "RedotPay team's risk control strategy" },
      { id: "D", label: "Your card status is normal (active)" },
    ],
    correct: ["A", "B", "C"],
  },
  {
    id: "q10",
    number: 10,
    kind: "multi",
    prompt: "Which statements are correct about RedotPay card status? (More than 1 answer)",
    options: [
      { id: "A", label: "Card 'Frozen' status is temporary and can be adjusted by itself" },
      { id: "B", label: "Cards in 'Active' status can be used as per normal" },
      { id: "C", label: "When your card is reported 'Lost' it is not available" },
      { id: "D", label: "Deleted cards are unavailable but can be reactivated" },
    ],
    correct: ["B", "C"],
  },
];

export const REDOTPAY_QUESTION_BY_ID = Object.fromEntries(
  REDOTPAY_QUIZ_QUESTIONS.map((q) => [q.id, q]),
) as Record<string, RedotPayQuizQuestion>;
