-- Reset legacy per-question quiz rows backfilled before the timed 10-question test.
-- Full timed submits always store all 10 question ids in answers; legacy rows do not.

WITH legacy_attempts AS (
  SELECT participant_id
  FROM redotpay_quiz_attempts
  WHERE submitted_at IS NOT NULL
    AND (
      answers IS NULL
      OR (
        SELECT count(*)::integer
        FROM jsonb_object_keys(answers)
      ) < 10
    )
)
DELETE FROM redotpay_quiz_submissions
WHERE participant_id IN (SELECT participant_id FROM legacy_attempts);

WITH legacy_attempts AS (
  SELECT id
  FROM redotpay_quiz_attempts
  WHERE submitted_at IS NOT NULL
    AND (
      answers IS NULL
      OR (
        SELECT count(*)::integer
        FROM jsonb_object_keys(answers)
      ) < 10
    )
)
DELETE FROM redotpay_quiz_attempts
WHERE id IN (SELECT id FROM legacy_attempts);
