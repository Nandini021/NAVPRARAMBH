import fs from "node:fs";
const env = {};
for (const file of [".env.local", ".env.demo.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}
const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || "").replace(/\/$/, "");
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const tables = ["jobs","internships","companies","courses","enrollments","user_certifications","careers","roadmaps","badges","user_badges","games","game_sessions","career_scores","goals","notifications","projects","pm_internships"];
for (const table of tables) {
  const response = await fetch(`${url}/rest/v1/${table}?select=id`, { method: "HEAD", headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
  const range = response.headers.get("content-range");
  const count = range?.split("/")[1] ?? (response.status === 404 ? "NOT_FOUND" : "UNKNOWN");
  console.log(`${table}\t${response.status}\t${count}`);
}
