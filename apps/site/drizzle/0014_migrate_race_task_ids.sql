-- Remap legacy Amazing Race task ids to the canonical 16-milestone catalog.
-- Idempotent: safe to re-run; only rows with legacy task_id values are touched.

WITH legacy_map AS (
  SELECT * FROM (
    VALUES
      ('content-first-impressions', 'race-landed-in-kuching'),
      ('race-sampan-ride', 'race-kuching-waterfront'),
      ('race-flagpole-lean', 'race-kuching-waterfront'),
      ('race-flagpole-group', 'race-kuching-waterfront')
  ) AS t(old_task_id, new_task_id)
),

-- Drop legacy rows superseded by an existing canonical row.
drop_older_legacy AS (
  DELETE FROM race_submissions AS legacy
  USING legacy_map AS map, race_submissions AS canonical
  WHERE legacy.task_id = map.old_task_id
    AND canonical.submitted_by = legacy.submitted_by
    AND canonical.task_id = map.new_task_id
    AND legacy.submitted_at <= canonical.submitted_at
  RETURNING legacy.id
),

-- Promote newer legacy proof into the canonical row.
merge_newer_legacy AS (
  SELECT
    legacy.id AS legacy_id,
    canonical.id AS canonical_id,
    legacy.thread_url,
    legacy.submitted_at
  FROM race_submissions AS legacy
  JOIN legacy_map AS map ON legacy.task_id = map.old_task_id
  JOIN race_submissions AS canonical
    ON canonical.submitted_by = legacy.submitted_by
   AND canonical.task_id = map.new_task_id
  WHERE legacy.submitted_at > canonical.submitted_at
),
apply_merge AS (
  UPDATE race_submissions AS canonical
  SET
    thread_url = merge_newer_legacy.thread_url,
    submitted_at = merge_newer_legacy.submitted_at,
    updated_at = NOW()
  FROM merge_newer_legacy
  WHERE canonical.id = merge_newer_legacy.canonical_id
  RETURNING merge_newer_legacy.legacy_id
),
drop_merged_legacy AS (
  DELETE FROM race_submissions AS legacy
  WHERE legacy.id IN (SELECT legacy_id FROM merge_newer_legacy)
  RETURNING legacy.id
),

-- Multiple legacy rows for one participant → keep the newest only.
drop_dup_legacy AS (
  DELETE FROM race_submissions
  WHERE id IN (
    SELECT id
    FROM (
      SELECT
        rs.id,
        ROW_NUMBER() OVER (
          PARTITION BY rs.submitted_by, map.new_task_id
          ORDER BY rs.submitted_at DESC
        ) AS rn
      FROM race_submissions rs
      JOIN legacy_map AS map ON rs.task_id = map.old_task_id
    ) ranked
    WHERE rn > 1
  )
  RETURNING id
)

-- Rename remaining legacy rows.
UPDATE race_submissions AS rs
SET
  task_id = map.new_task_id,
  updated_at = NOW()
FROM legacy_map AS map
WHERE rs.task_id = map.old_task_id;
