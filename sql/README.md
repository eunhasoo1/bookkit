SQL execution order (Supabase SQL editor):

1. 01_schema.sql
2. 02_functions.sql
3. 04_rls_policies.sql
4. 03_seed.sql (optional, dev only)

Notes:
- 03_seed.sql requires a real auth.users.id. Replace seed_user_id before running.
- If you want profile rows in public.users, insert them separately or add a trigger.
