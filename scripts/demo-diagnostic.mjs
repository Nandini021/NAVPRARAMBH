import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const env = {};
for (const file of [".env.local", ".env.demo.local", ".env"]) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}
const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || "").replace(/\/$/, "");
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase URL/public key");
const baseHeaders = { apikey: key, Authorization: `Bearer ${key}` };
async function request(endpoint, init = {}) {
  const response = await fetch(`${url}${endpoint}`, { ...init, headers: { ...baseHeaders, ...(init.headers || {}) } });
  let body;
  try { body = await response.json(); } catch { body = await response.text(); }
  return { status: response.status, body };
}
const tables = [
  "jobs", "internships", "companies", "courses", "enrollments", "user_certifications",
  "careers", "roadmaps", "badges", "user_badges", "games", "game_sessions",
  "career_scores", "goals", "notifications", "projects", "pm_internships",
];
const result = { project: url.replace("https://", ""), authSettings: null, tables: {} };
const settings = await request("/auth/v1/settings");
result.authSettings = { status: settings.status, disable_signup: settings.body?.disable_signup, mailer_autoconfirm: settings.body?.mailer_autoconfirm, external: settings.body?.external };
for (const table of tables) {
  const response = await request(`/rest/v1/${table}?select=*&limit=3`);
  result.tables[table] = Array.isArray(response.body)
    ? { status: response.status, rows: response.body.length, sample: response.body }
    : { status: response.status, rows: null, sample: [], error: response.body };
}
const testEmail = `demo.diagnostic.${Date.now()}@gmail.com`;
const testPassword = `NvpDemo-${crypto.randomBytes(8).toString("hex")}!`;
const signup = await request("/auth/v1/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: testEmail, password: testPassword, data: { full_name: "Demo Diagnostic Student" } }),
});
result.signup = { email: testEmail, status: signup.status, hasSession: Boolean(signup.body?.access_token), userId: signup.body?.user?.id || null, error: signup.body?.msg || signup.body?.error_description || signup.body?.message || null };
const login = await request("/auth/v1/token?grant_type=password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: testEmail, password: testPassword }),
});
result.login = { status: login.status, hasSession: Boolean(login.body?.access_token), error: login.body?.error_description || login.body?.msg || login.body?.message || null };
if (login.body?.access_token && signup.body?.user?.id) {
  const profileResponse = await fetch(`${url}/rest/v1/profiles?select=*&id=eq.${signup.body.user.id}`, { headers: { apikey: key, Authorization: `Bearer ${login.body.access_token}` } });
  let body;
  try { body = await profileResponse.json(); } catch { body = await profileResponse.text(); }
  result.profileAfterLogin = { status: profileResponse.status, rows: Array.isArray(body) ? body.length : null, sample: Array.isArray(body) ? body.slice(0, 1) : body };
}
console.log(JSON.stringify(result, null, 2));
