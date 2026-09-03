CREATE TABLE IF NOT EXISTS redotpay_quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer jsonb NOT NULL,
  is_correct boolean NOT NULL,
  quiz_day text NOT NULL,
  won_daily_prize boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT redotpay_quiz_submissions_participant_question_unique UNIQUE (participant_id, question_id)
);

CREATE INDEX IF NOT EXISTS redotpay_quiz_submissions_quiz_day_idx
  ON redotpay_quiz_submissions (quiz_day);

CREATE INDEX IF NOT EXISTS redotpay_quiz_submissions_daily_winners_idx
  ON redotpay_quiz_submissions (quiz_day, won_daily_prize);
