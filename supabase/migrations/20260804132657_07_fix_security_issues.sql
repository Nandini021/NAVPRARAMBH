/*
# Fix Security Issues: Search Path & Function Execution

## Summary
Fixes three security advisor findings:

1. **Mutable search_path on `set_updated_at`** — The function had no fixed
   search_path, allowing a malicious actor to shadow objects. This migration
   redefines it with `SET search_path = public` so the path is immutable.

2. **`anon` can execute `handle_new_user()` SECURITY DEFINER** — The function
   was callable by anon via `/rest/v1/rpc/handle_new_user`. It is a trigger
   function that should ONLY fire on `auth.users` INSERT, never via REST.
   This migration revokes EXECUTE from `anon` and `authenticated` and from
   `public` (the default role group).

3. **`authenticated` can execute `handle_new_user()` SECURITY DEFINER** —
   Same fix as above; the revoke covers both roles plus `public`.

## Changes
- Recreate `set_updated_at()` with `SET search_path = public`.
- `REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated, public`.
- The trigger on `auth.users` still works because trigger functions execute
  with the privileges of the invoking role (the database owner), not via
  the REST API.

## Security
- No new tables or policies.
- No data changes.
*/

-- ─── 1. Fix mutable search_path on set_updated_at ────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── 2. Revoke EXECUTE on handle_new_user from all callable roles ─
-- The function is a trigger on auth.users; it does not need to be
-- callable via the REST API by anon or authenticated users.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
