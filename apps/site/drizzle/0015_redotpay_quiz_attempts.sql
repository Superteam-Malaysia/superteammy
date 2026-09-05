-- Timed RedotPay quiz: one attempt per participant, score logged on submit.
CREATE TABLE IF NOT EXISTS redotpay_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 10,
  answers jsonb,
  duration_ms integer,
  CONSTRAINT redotpay_quiz_attempts_participant_unique UNIQUE (participant_id)
);

CREATE INDEX IF NOT EXISTS redotpay_quiz_attempts_score_idx
  ON redotpay_quiz_attempts (score DESC, submitted_at ASC);

-- Backfill completed attempts from legacy per-question rows.
INSERT INTO redotpay_quiz_attempts (participant_id, started_at, submitted_at, score, total_questions, answers, duration_ms)
SELECT
  participant_id,
  MIN(submitted_at) AS started_at,
  MAX(submitted_at) AS submitted_at,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::integer AS score,
  10 AS total_questions,
  jsonb_object_agg(question_id, answer) AS answers,
  GREATEST(
    0,
    (EXTRACT(EPOCH FROM (MAX(submitted_at) - MIN(submitted_at))) * 1000)::integer
  ) AS duration_ms
FROM redotpay_quiz_submissions
GROUP BY participant_id
ON CONFLICT (participant_id) DO NOTHING;
