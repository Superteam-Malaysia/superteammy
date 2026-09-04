/**
 * Upsert Content / DevRel roles for Nikki and Semi in Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npm run patch:member-subscripts
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: [".env.local", ".env"] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

type ProfileRow = {
  id: string;
  nickname: string | null;
  real_name: string | null;
  member_number: number | null;
  twitter_url: string | null;
};

async function ensureRole(name: string): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing?.id) return existing.id;

  const { data, error } = await supabase.from("roles").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function linkRole(profileId: string, roleId: string, label: string) {
  const { error } = await supabase.from("profile_roles").upsert(
    { profile_id: profileId, role_id: roleId },
    { onConflict: "profile_id,role_id" },
  );
  if (error) throw error;
  console.log(`  linked ${label}`);
}

function matchesNikki(profile: ProfileRow): boolean {
  const nick = (profile.nickname || profile.real_name || "").toLowerCase();
  const twitter = (profile.twitter_url || "").toLowerCase();
  return nick.includes("nikki") || twitter.includes("nikkideyy");
}

function matchesSemi(profile: ProfileRow): boolean {
  const nick = (profile.nickname || profile.real_name || "").toLowerCase();
  const twitter = (profile.twitter_url || "").toLowerCase();
  return profile.member_number === 22 || nick.includes("semi") || twitter.includes("semi");
}

async function main() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, nickname, real_name, member_number, twitter_url");

  if (error) throw error;
  if (!profiles?.length) {
    console.log("No profiles found.");
    return;
  }

  const contentRoleId = await ensureRole("Content");
  const devrelRoleId = await ensureRole("DevRel");

  for (const profile of profiles as ProfileRow[]) {
    const name = profile.nickname || profile.real_name || profile.id;
    if (matchesNikki(profile)) {
      await linkRole(profile.id, contentRoleId, `${name} → Content`);
    }
    if (matchesSemi(profile)) {
      await linkRole(profile.id, devrelRoleId, `${name} → DevRel`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
