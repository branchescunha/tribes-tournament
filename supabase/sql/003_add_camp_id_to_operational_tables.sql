alter table public.tribes
  add column if not exists camp_id uuid references public.camps(id);

alter table public.participants
  add column if not exists camp_id uuid references public.camps(id);

alter table public.score_events
  add column if not exists camp_id uuid references public.camps(id);

alter table public.gymkhana_events
  add column if not exists camp_id uuid references public.camps(id);

alter table public.gymkhana_settings
  add column if not exists camp_id uuid references public.camps(id);

alter table public.room_inspections
  add column if not exists camp_id uuid references public.camps(id);

create index if not exists tribes_camp_id_idx
  on public.tribes(camp_id);

create index if not exists participants_camp_id_idx
  on public.participants(camp_id);

create index if not exists score_events_camp_id_idx
  on public.score_events(camp_id);

create index if not exists gymkhana_events_camp_id_idx
  on public.gymkhana_events(camp_id);

create index if not exists gymkhana_settings_camp_id_idx
  on public.gymkhana_settings(camp_id);

create index if not exists room_inspections_camp_id_idx
  on public.room_inspections(camp_id);

/*
  Migração manual opcional de dados antigos:

  1. Crie ou identifique um acampamento em public.camps.
  2. Copie o id desse acampamento.
  3. Execute updates explícitos, revisando cada tabela antes:

     update public.tribes set camp_id = '<camp-id>' where camp_id is null;
     update public.participants set camp_id = '<camp-id>' where camp_id is null;
     update public.score_events set camp_id = '<camp-id>' where camp_id is null;
     update public.gymkhana_events set camp_id = '<camp-id>' where camp_id is null;
     update public.gymkhana_settings set camp_id = '<camp-id>' where camp_id is null;
     update public.room_inspections set camp_id = '<camp-id>' where camp_id is null;

  Não execute esses updates sem validar que todos os dados antigos pertencem ao
  mesmo acampamento.
*/
