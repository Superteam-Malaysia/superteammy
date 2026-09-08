-- Split combined waterfront milestone into per-activity task ids.
-- Idempotent: only touches rows still tagged race-kuching-waterfront.
-- Tweet text classification (Sep 2026): all 9 production posts → sampan ride.
-- Media-only / unclassified rows also map to sampan (see waterfront-classify overrides).

UPDATE race_submissions
SET
  task_id = 'race-sampan-ride',
  updated_at = NOW()
WHERE task_id = 'race-kuching-waterfront'
  AND (
    thread_url LIKE '%2097209432073801750%'
    OR thread_url LIKE '%2097172441290387605%'
    OR thread_url LIKE '%2097123874152628646%'
    OR thread_url LIKE '%2096792897068925092%'
    OR thread_url LIKE '%2096657910923501738%'
    OR thread_url LIKE '%2096529155143991612%'
    OR thread_url LIKE '%2096225862144376909%'
    OR thread_url LIKE '%2096177992796193139%'
    OR thread_url LIKE '%2096160352992203115%'
  );

-- Safety net: never leave combined waterfront rows behind (no post loss).
UPDATE race_submissions
SET
  task_id = 'race-sampan-ride',
  updated_at = NOW()
WHERE task_id = 'race-kuching-waterfront';
