-- Index the foreign keys that carry real query load.
--
-- Postgres creates an index for a PRIMARY KEY and a UNIQUE constraint, but not
-- for a FOREIGN KEY. Two consequences here:
--
--   1. projects.profile_id had no index at all, and the member dashboard runs
--      `.eq("profile_id", user.id)` on every load.
--   2. The junction tables have composite primary keys like
--      (profile_id, role_id). That index serves lookups on profile_id, and on
--      the pair, but NOT on role_id alone -- so the reverse direction
--      ("everyone with skill X", which the members filter does) is a seq scan,
--      as is the FK check when a parent row is deleted.
--
-- Nothing here changes behaviour; it is all planner input. At the current row
-- counts these are cheap insurance rather than a fix for anything measurably
-- slow today.

-- Owned rows -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_profile_id
  ON projects(profile_id);

-- Junction tables: second column of each composite PK ------------------------
CREATE INDEX IF NOT EXISTS idx_profile_roles_role_id
  ON profile_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_profile_companies_company_id
  ON profile_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id
  ON profile_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_profile_subskills_subskill_id
  ON profile_subskills(subskill_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id
  ON project_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_project_subskills_subskill_id
  ON project_subskills(subskill_id);

-- Remaining unindexed foreign keys -------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subskills_skill_id
  ON subskills(skill_id);
CREATE INDEX IF NOT EXISTS idx_invites_used_by
  ON invites(used_by) WHERE used_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invites_created_by
  ON invites(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_approved_by
  ON profiles(approved_by) WHERE approved_by IS NOT NULL;
