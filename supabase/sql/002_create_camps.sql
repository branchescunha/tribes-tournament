create table if not exists public.camps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  church_name text not null,
  theme text,
  start_date date,
  end_date date,
  status text not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint camps_name_not_empty
    check (length(trim(name)) > 0),
  constraint camps_church_name_not_empty
    check (length(trim(church_name)) > 0),
  constraint camps_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint camps_date_order_check
    check (
      start_date is null
      or end_date is null
      or end_date >= start_date
    )
);

alter table public.camps enable row level security;

grant select, insert, update
on public.camps
to authenticated;

create policy "Users can create their own camps"
on public.camps
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Users can read their own camps"
on public.camps
for select
to authenticated
using (created_by = auth.uid());

create policy "Users can update their own camps"
on public.camps
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());
