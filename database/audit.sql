-- Server-created audit records. Browser clients can read their own records only.
create table public.us4c_audit_events (
  id bigint generated always as identity primary key,
  case_id text not null,
  owner_id uuid not null,
  actor_id uuid,
  event_at timestamptz not null default now(),
  action text not null,
  changed_fields text[] not null,
  detail jsonb not null default '{}'::jsonb
);
create index us4c_audit_events_owner_case_idx on public.us4c_audit_events(owner_id,case_id,event_at desc);
alter table public.us4c_audit_events enable row level security;
revoke all on public.us4c_audit_events from anon,authenticated;
grant select on public.us4c_audit_events to authenticated;
create policy "Read own server audit" on public.us4c_audit_events for select to authenticated using ((select auth.uid())=owner_id);
create function public.us4c_record_case_audit() returns trigger
language plpgsql security definer set search_path='' as $$
declare changed text[]; entry jsonb; label text;
begin
  if new.is_demo then return new; end if;
  if tg_op='INSERT' then
    changed:=array['case_created']; label:='Incident registered';
  else
    select coalesce(array_agg(k),'{}'::text[]) into changed
    from (select jsonb_object_keys(old.payload) k union select jsonb_object_keys(new.payload) k) keys
    where old.payload->k is distinct from new.payload->k;
    if cardinality(changed)=0 then return new; end if;
    label:='Case record updated';
  end if;
  entry:=new.payload#>'{investigation,audit,-1}';
  if entry is not null and (tg_op='INSERT' or entry is distinct from old.payload#>'{investigation,audit,-1}') then
    label:=left(coalesce(entry->>'action',label),160);
  else entry:='{}'::jsonb; end if;
  insert into public.us4c_audit_events(case_id,owner_id,actor_id,action,changed_fields,detail)
  values(new.id,new.owner_id,auth.uid(),label,changed,jsonb_build_object('operator_note',left(coalesce(entry->>'detail',''),3000),'stage',left(coalesce(entry->>'stage',''),160)));
  return new;
end; $$;
revoke all on function public.us4c_record_case_audit() from public,anon,authenticated;
create trigger us4c_cases_server_audit after insert or update on public.us4c_cases for each row execute function public.us4c_record_case_audit();
