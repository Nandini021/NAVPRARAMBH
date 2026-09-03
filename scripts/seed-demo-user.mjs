import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.DEMO_EMAIL ?? "demo.student@navprarambh.example";
const password = process.env.DEMO_PASSWORD;
const fullName = "Aarav Mehta";

if (!url || !serviceRoleKey || !password) {
  throw new Error(
    "Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DEMO_PASSWORD before running this script."
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checked(label, request) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function getOrCreateUser() {
  const listed = await checked("List demo users", supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  }));
  const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const created = await checked("Create demo Auth user", supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  }));
  return created.user;
}

const user = await getOrCreateUser();
if (!user) throw new Error("Supabase did not return the demo user.");

await checked("Upsert demo student profile", supabase.from("profiles").upsert({
  id: user.id,
  full_name: fullName,
  email,
  role: "student",
}, { onConflict: "id" }));

await checked("Seed shared catalog", supabase.rpc("seed_development_catalog", {
  owner_id: user.id,
}));

const privateRows = {
  applications: [
    {
      id: "00000000-0000-4000-8000-000000000901",
      user_id: user.id,
      internship_id: "00000000-0000-4000-8000-000000000301",
      status: "shortlisted",
      cover_letter: "[DEV] Interested in building accessible product experiences.",
    },
    {
      id: "00000000-0000-4000-8000-000000000902",
      user_id: user.id,
      job_id: "00000000-0000-4000-8000-000000000202",
      status: "pending",
      cover_letter: "[DEV] Interested in practical analytics work.",
    },
  ],
  enrollments: [
    { id: "00000000-0000-4000-8000-000000001001", user_id: user.id, course_id: "00000000-0000-4000-8000-000000000401", progress: 62, completed: false },
    { id: "00000000-0000-4000-8000-000000001002", user_id: user.id, course_id: "00000000-0000-4000-8000-000000000402", progress: 100, completed: true, completed_at: new Date().toISOString() },
  ],
  user_certifications: [
    { id: "00000000-0000-4000-8000-000000001101", user_id: user.id, name: "[DEV] SQL Foundations", provider: "NavPrarambh Learning Team", issue_date: "2026-07-10", verified: true, credential_url: "https://example.com/certificates/sql" },
  ],
  roadmaps: [
    { id: "00000000-0000-4000-8000-000000001201", user_id: user.id, career_id: "00000000-0000-4000-8000-000000000501", title: "[DEV] Frontend Engineer Roadmap", progress: 38, steps: [{ step: "HTML and CSS", description: "Build accessible layouts.", completed: true }, { step: "JavaScript", description: "Master browser fundamentals.", completed: true }, { step: "React projects", description: "Ship two portfolio projects.", completed: false }] },
  ],
};

for (const [table, rows] of Object.entries(privateRows)) {
  await checked(`Seed ${table}`, supabase.from(table).upsert(rows, { onConflict: "id" }));
}

await checked("Seed career score", supabase.from("career_scores").upsert({
  id: "00000000-0000-4000-8000-000000001301",
  user_id: user.id,
  career_score: 68,
  placement_readiness: 61,
  resume_score: 72,
  ats_score: 74,
  interview_readiness: 58,
  xp: 1240,
}, { onConflict: "id" }));

await checked("Seed goals", supabase.from("goals").upsert([
  { id: "00000000-0000-4000-8000-000000001401", user_id: user.id, title: "[DEV] Complete one SQL lesson", type: "daily", completed: true },
  { id: "00000000-0000-4000-8000-000000001402", user_id: user.id, title: "[DEV] Apply to two roles", type: "weekly", completed: false },
], { onConflict: "id" }));

await checked("Seed notifications", supabase.from("notifications").upsert([
  { id: "00000000-0000-4000-8000-000000001501", user_id: user.id, text: "[DEV] A new frontend internship matches your skills.", type: "internship-alert", read: false },
  { id: "00000000-0000-4000-8000-000000001502", user_id: user.id, text: "[DEV] Complete your SQL lesson to keep learning momentum.", type: "course", read: true },
], { onConflict: "id" }));

await checked("Seed projects", supabase.from("projects").upsert([
  { id: "00000000-0000-4000-8000-000000001601", user_id: user.id, title: "[DEV] Campus Events Finder", description: "Fictional React portfolio project.", tech_stack: ["React", "TypeScript"], status: "in_progress", project_url: "https://example.com/projects/events" },
], { onConflict: "id" }));

await checked("Seed user badges", supabase.from("user_badges").upsert([
  { id: "00000000-0000-4000-8000-000000001701", user_id: user.id, badge_id: "00000000-0000-4000-8000-000000000801", earned_at: new Date().toISOString() },
], { onConflict: "id" }));

await checked("Seed game session", supabase.from("game_sessions").upsert([
  { id: "00000000-0000-4000-8000-000000001801", user_id: user.id, game_id: "00000000-0000-4000-8000-000000000701", score: 82, xp_earned: 100, coins_earned: 20 },
], { onConflict: "id" }));

console.log(`Seeded development data for ${email} (${user.id}).`);
