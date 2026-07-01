create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  church_name text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  constraint access_requests_status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint access_requests_name_not_empty
    check (length(trim(name)) > 0),
  constraint access_requests_email_not_empty
    check (length(trim(email)) > 0),
  constraint access_requests_church_name_not_empty
    check (length(trim(church_name)) > 0)
);

alter table public.access_requests enable row level security;

grant insert (name, email, church_name, message, status)
on public.access_requests
to anon;

grant select
on public.access_requests
to authenticated;

grant update (status, reviewed_at, reviewed_by)
on public.access_requests
to authenticated;

create policy "Anonymous users can create pending access requests"
on public.access_requests
for insert
to anon
with check (
  status = 'pending'
  and reviewed_at is null
  and reviewed_by is null
);

create policy "Authenticated users can read access requests"
on public.access_requests
for select
to authenticated
using (true);

create policy "Authenticated users can review access requests"
on public.access_requests
for update
to authenticated
using (true)
with check (
  status in ('pending', 'approved', 'rejected')
  and reviewed_by = auth.uid()
);
