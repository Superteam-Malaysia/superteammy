-- Admins curate the project showcase.
--
-- projects was built as member-owned proof of work: only the owner could
-- INSERT (auth.uid() = profile_id), and only the owner or a super_admin could
-- UPDATE/DELETE. Admins now need to add and edit entries on a member's behalf,
-- so widen the writes to the same admin roles used everywhere else. Owners keep
-- their existing access -- this only adds, it never takes any away.
--
-- Also adds the few columns a showcase needs beyond title/description/link.
-- profile_id stays NOT NULL: a project is always someone's proof of work, so
-- the admin form picks an owner.

-- =============================================================================
-- 1. Showcase columns
-- =============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_showcase
  ON projects(is_featured, display_order);

-- =============================================================================
-- 2. Admin writes on projects
-- =============================================================================
-- SELECT is already USING (true) and stays that way -- the showcase is public.

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (
    auth.uid() = profile_id
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    auth.uid() = profile_id
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (
    auth.uid() = profile_id
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

-- =============================================================================
-- 3. Admin writes on the skill junctions
-- =============================================================================
-- These previously allowed the parent project's owner or a super_admin. Without
-- widening them too, an admin could create a project but not tag it.

DROP POLICY IF EXISTS "project_skills_insert" ON project_skills;
CREATE POLICY "project_skills_insert" ON project_skills
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND profile_id = auth.uid())
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "project_skills_delete" ON project_skills;
CREATE POLICY "project_skills_delete" ON project_skills
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND profile_id = auth.uid())
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "project_subskills_insert" ON project_subskills;
CREATE POLICY "project_subskills_insert" ON project_subskills
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND profile_id = auth.uid())
    OR public.get_user_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS "project_subskills_delete" ON project_subskills;
CREATE POLICY "project_subskills_delete" ON project_subskills
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND profile_id = auth.uid())
    OR public.get_user_role() IN ('super_admin', 'admin')
  );
