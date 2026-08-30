export const dynamic = "force-dynamic";

import { AdminShowcaseClient } from "@/app/admin/showcase/AdminShowcaseClient";
import { getAllProjects } from "@/lib/supabase/queries";

export default async function ShowcasePage() {
  const projects = await getAllProjects();
  return <AdminShowcaseClient initialProjects={projects} />;
}
