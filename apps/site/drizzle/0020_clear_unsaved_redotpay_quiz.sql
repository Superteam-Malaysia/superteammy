-- Remove attempts closed at 0/10 with no saved answers (timer auto-submit bug).
DELETE FROM redotpay_quiz_attempts
WHERE submitted_at IS NOT NULL
  AND score = 0
  AND (answers IS NULL OR answers = '{}'::jsonb);
