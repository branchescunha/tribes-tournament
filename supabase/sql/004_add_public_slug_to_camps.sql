alter table public.camps
  add column if not exists slug text;

alter table public.camps
  add column if not exists public_ranking_enabled boolean not null default true;

create unique index if not exists camps_slug_lower_unique_idx
  on public.camps (lower(slug))
  where slug is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'camps_slug_format_check'
  ) then
    alter table public.camps
      add constraint camps_slug_format_check
      check (
        slug is null
        or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'camps_slug_reserved_check'
  ) then
    alter table public.camps
      add constraint camps_slug_reserved_check
      check (
        slug is null
        or lower(slug) not in (
          'admin',
          'login',
          'ranking',
          'solicitar-acesso',
          'recuperar-senha',
          'redefinir-senha',
          'auth',
          'api'
        )
      );
  end if;
end $$;

revoke select
on public.camps
from anon;

revoke select
on public.tribes
from anon;

revoke select
on public.participants
from anon;

revoke select
on public.score_events
from anon;

drop view if exists public.public_ranking_score_events;
drop view if exists public.public_ranking_participants;
drop view if exists public.public_ranking_tribes;

grant select (
  id,
  name,
  church_name,
  theme,
  slug,
  public_ranking_enabled
)
on public.camps
to anon;

drop policy if exists "Public can read camps with enabled ranking"
on public.camps;

create policy "Public can read camps with enabled ranking"
on public.camps
for select
to anon
using (
  public_ranking_enabled = true
  and slug is not null
);

create view public.public_ranking_tribes
with (security_barrier = true)
as
select
  tribes.id,
  tribes.camp_id,
  tribes.name,
  tribes.color,
  tribes.symbol
from public.tribes
inner join public.camps
  on camps.id = tribes.camp_id
where camps.public_ranking_enabled = true
  and camps.slug is not null;

create view public.public_ranking_participants
with (security_barrier = true)
as
select
  participants.camp_id,
  participants.tribe_id,
  participants.is_active
from public.participants
inner join public.camps
  on camps.id = participants.camp_id
where participants.is_active = true
  and camps.public_ranking_enabled = true
  and camps.slug is not null;

create view public.public_ranking_score_events
with (security_barrier = true)
as
select
  score_events.camp_id,
  score_events.tribe_id,
  score_events.points
from public.score_events
inner join public.camps
  on camps.id = score_events.camp_id
where camps.public_ranking_enabled = true
  and camps.slug is not null;

grant select
on public.public_ranking_tribes
to anon;

grant select
on public.public_ranking_participants
to anon;

grant select
on public.public_ranking_score_events
to anon;
