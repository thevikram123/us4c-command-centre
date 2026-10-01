-- Dedicated US4C project. Sample/demo records are read-only; operator records are private.
create table if not exists public.us4c_cases (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint us4c_case_ownership check ((is_demo and owner_id is null) or (not is_demo and owner_id is not null)),
  constraint us4c_case_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint us4c_case_payload_size check (octet_length(payload::text) <= 60000)
);
create index if not exists us4c_cases_owner_id_idx on public.us4c_cases(owner_id);
alter table public.us4c_cases enable row level security;
revoke all on table public.us4c_cases from anon, authenticated;
grant select on public.us4c_cases to anon;
grant select, insert, update, delete on public.us4c_cases to authenticated;
create policy "Read synthetic examples" on public.us4c_cases for select to anon, authenticated using (is_demo = true);
create policy "Read own cases" on public.us4c_cases for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Create own cases" on public.us4c_cases for insert to authenticated with check ((select auth.uid()) = owner_id and is_demo = false);
create policy "Update own cases" on public.us4c_cases for update to authenticated using ((select auth.uid()) = owner_id and is_demo = false) with check ((select auth.uid()) = owner_id and is_demo = false);
create policy "Delete own cases" on public.us4c_cases for delete to authenticated using ((select auth.uid()) = owner_id and is_demo = false);
create function public.us4c_touch_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger us4c_cases_updated_at before update on public.us4c_cases for each row execute function public.us4c_touch_updated_at();

