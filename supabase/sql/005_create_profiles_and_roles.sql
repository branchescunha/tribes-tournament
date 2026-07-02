create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'gestor',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check
    check (role in ('admin', 'gestor')),
  constraint profiles_status_check
    check (status in ('active', 'suspended'))
);

alter table public.profiles enable row level security;

grant select
on public.profiles
to authenticated;

grant insert (id, name, role, status)
on public.profiles
to authenticated;

grant update (name, role, status, updated_at)
on public.profiles
to authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  );
$$;

create or replace function public.is_active_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'gestor'
      and profiles.status = 'active'
  );
$$;

create or replace function public.can_manage_camp(target_camp_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.profiles
      inner join public.camps
        on camps.id = target_camp_id
      where profiles.id = auth.uid()
        and profiles.role = 'gestor'
        and profiles.status = 'active'
        and camps.created_by = auth.uid()
    );
$$;

drop policy if exists "Users can read their own profile"
on public.profiles;

drop policy if exists "Admins can read all profiles"
on public.profiles;

drop policy if exists "Admins can create profiles"
on public.profiles;

drop policy if exists "Admins can update profiles"
on public.profiles;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_platform_admin());

create policy "Admins can create profiles"
on public.profiles
for insert
to authenticated
with check (public.is_platform_admin());

create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Authenticated users can read access requests"
on public.access_requests;

drop policy if exists "Authenticated users can review access requests"
on public.access_requests;

drop policy if exists "Admins can read access requests"
on public.access_requests;

drop policy if exists "Admins can review access requests"
on public.access_requests;

create policy "Admins can read access requests"
on public.access_requests
for select
to authenticated
using (public.is_platform_admin());

create policy "Admins can review access requests"
on public.access_requests
for update
to authenticated
using (public.is_platform_admin())
with check (
  public.is_platform_admin()
  and status in ('pending', 'approved', 'rejected')
  and reviewed_by = auth.uid()
);

drop policy if exists "Users can create their own camps"
on public.camps;

drop policy if exists "Users can read their own camps"
on public.camps;

drop policy if exists "Users can update their own camps"
on public.camps;

drop policy if exists "Admins can manage all camps"
on public.camps;

drop policy if exists "Admins can read all camps"
on public.camps;

drop policy if exists "Admins can create camps"
on public.camps;

drop policy if exists "Admins can update all camps"
on public.camps;

drop policy if exists "Gestors can create their own camps"
on public.camps;

drop policy if exists "Gestors can read their own camps"
on public.camps;

drop policy if exists "Gestors can update their own camps"
on public.camps;

create policy "Admins can read all camps"
on public.camps
for select
to authenticated
using (public.is_platform_admin());

create policy "Admins can create camps"
on public.camps
for insert
to authenticated
with check (public.is_platform_admin());

create policy "Admins can update all camps"
on public.camps
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Gestors can create their own camps"
on public.camps
for insert
to authenticated
with check (
  public.is_active_gestor()
  and created_by = auth.uid()
);

create policy "Gestors can read their own camps"
on public.camps
for select
to authenticated
using (
  public.is_active_gestor()
  and created_by = auth.uid()
);

create policy "Gestors can update their own camps"
on public.camps
for update
to authenticated
using (
  public.is_active_gestor()
  and created_by = auth.uid()
)
with check (
  public.is_active_gestor()
  and created_by = auth.uid()
);

alter table public.tribes enable row level security;
alter table public.participants enable row level security;
alter table public.score_events enable row level security;
alter table public.gymkhana_events enable row level security;
alter table public.gymkhana_settings enable row level security;
alter table public.room_inspections enable row level security;

grant select, insert, update, delete
on public.tribes
to authenticated;

grant select, insert, update, delete
on public.participants
to authenticated;

grant select, insert, update, delete
on public.score_events
to authenticated;

grant select, insert, update, delete
on public.gymkhana_events
to authenticated;

grant select, insert, update, delete
on public.gymkhana_settings
to authenticated;

grant select, insert, update, delete
on public.room_inspections
to authenticated;

revoke select
on public.tribes
from anon;

revoke select
on public.participants
from anon;

revoke select
on public.score_events
from anon;

revoke select
on public.gymkhana_events
from anon;

revoke select
on public.gymkhana_settings
from anon;

revoke select
on public.room_inspections
from anon;

drop policy if exists "Authenticated users can manage tribes by camp"
on public.tribes;

create policy "Authenticated users can manage tribes by camp"
on public.tribes
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

drop policy if exists "Authenticated users can manage participants by camp"
on public.participants;

create policy "Authenticated users can manage participants by camp"
on public.participants
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

drop policy if exists "Authenticated users can manage score events by camp"
on public.score_events;

create policy "Authenticated users can manage score events by camp"
on public.score_events
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

drop policy if exists "Authenticated users can manage gymkhana events by camp"
on public.gymkhana_events;

create policy "Authenticated users can manage gymkhana events by camp"
on public.gymkhana_events
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

drop policy if exists "Authenticated users can manage gymkhana settings by camp"
on public.gymkhana_settings;

create policy "Authenticated users can manage gymkhana settings by camp"
on public.gymkhana_settings
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

drop policy if exists "Authenticated users can manage room inspections by camp"
on public.room_inspections;

create policy "Authenticated users can manage room inspections by camp"
on public.room_inspections
for all
to authenticated
using (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
)
with check (
  public.can_manage_camp(camp_id)
  or (camp_id is null and public.is_platform_admin())
);

/*
  Primeiro ADMIN manual:

  insert into public.profiles (id, name, role, status)
  values ('<auth-user-id>', 'André Cunha', 'admin', 'active')
  on conflict (id) do update
  set name = excluded.name,
      role = 'admin',
      status = 'active',
      updated_at = now();

  GESTOR manual:

  insert into public.profiles (id, name, role, status)
  values ('<auth-user-id>', '<Nome do Gestor>', 'gestor', 'active')
  on conflict (id) do update
  set name = excluded.name,
      role = 'gestor',
      status = 'active',
      updated_at = now();
*/
