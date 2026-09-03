# Development seed

This seed uses the real Supabase Auth and PostgreSQL database.

## 1. Apply migrations

Apply the migrations in `supabase/migrations/` to the development Supabase project, including:

- `20260814000000_secure_public_signup_role.sql`
- `20260814010000_seed_development_catalog.sql`

Use the Supabase CLI or the Supabase dashboard SQL/migration workflow. Do not run these through the Vite app.

## 2. Run the demo-user seed

Run the script from the project root with server-only environment variables:

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "server-only-service-role-key"
$env:DEMO_EMAIL = "demo.student@navprarambh.example"
$env:DEMO_PASSWORD = "use-a-local-development-password"
node .\scripts\seed-demo-user.mjs
```

The service-role key must never be placed in `.env` variables beginning with `VITE_`, imported by `src/`, or shipped to the browser.

The script is repeatable. It creates or finds the demo Auth user, keeps the profile role as `student`, invokes the catalog seed function, and upserts the demo user's private development rows.

All seed records are clearly marked with `[DEV]` where the existing schema has no dedicated environment column.
