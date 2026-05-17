create table if not exists public.spotlight_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  title text not null check (char_length(title) > 0 and char_length(title) <= 40),
  subtitle text check (subtitle is null or char_length(subtitle) <= 70),
  body text check (body is null or char_length(body) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, event_id)
);

create table if not exists public.spotlight_participant_photos (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null,
  event_id uuid not null references public.events(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  uploaded_at timestamptz not null default now(),
  foreign key (participant_id, event_id)
    references public.spotlight_participants(id, event_id)
    on delete cascade
);

create table if not exists public.live_screen_states (
  event_id uuid primary key references public.events(id) on delete cascade,
  mode text not null default 'live' check (mode in ('live', 'spotlight')),
  active_participant_id uuid,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (
    (mode = 'live' and active_participant_id is null)
    or (mode = 'spotlight' and active_participant_id is not null)
  ),
  foreign key (active_participant_id, event_id)
    references public.spotlight_participants(id, event_id)
);

create index if not exists spotlight_participants_event_id_idx
on public.spotlight_participants(event_id);

create index if not exists spotlight_participant_photos_event_id_idx
on public.spotlight_participant_photos(event_id);

create index if not exists spotlight_participant_photos_participant_id_idx
on public.spotlight_participant_photos(participant_id);

alter table public.spotlight_participants enable row level security;
alter table public.spotlight_participant_photos enable row level security;
alter table public.live_screen_states enable row level security;

grant select, insert, update, delete on table public.spotlight_participants to authenticated;
grant select, insert, update, delete on table public.spotlight_participant_photos to authenticated;
grant select, insert, update, delete on table public.live_screen_states to authenticated;

grant select, insert, update, delete on table public.spotlight_participants to service_role;
grant select, insert, update, delete on table public.spotlight_participant_photos to service_role;
grant select, insert, update, delete on table public.live_screen_states to service_role;

drop policy if exists "spotlight participants owner read" on public.spotlight_participants;
create policy "spotlight participants owner read"
on public.spotlight_participants for select
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participants.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight participants owner insert" on public.spotlight_participants;
create policy "spotlight participants owner insert"
on public.spotlight_participants for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participants.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight participants owner update" on public.spotlight_participants;
create policy "spotlight participants owner update"
on public.spotlight_participants for update
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participants.event_id and events.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participants.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight participants owner delete" on public.spotlight_participants;
create policy "spotlight participants owner delete"
on public.spotlight_participants for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participants.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight photos owner read" on public.spotlight_participant_photos;
create policy "spotlight photos owner read"
on public.spotlight_participant_photos for select
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participant_photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight photos owner insert" on public.spotlight_participant_photos;
create policy "spotlight photos owner insert"
on public.spotlight_participant_photos for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participant_photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight photos owner update" on public.spotlight_participant_photos;
create policy "spotlight photos owner update"
on public.spotlight_participant_photos for update
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participant_photos.event_id and events.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participant_photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "spotlight photos owner delete" on public.spotlight_participant_photos;
create policy "spotlight photos owner delete"
on public.spotlight_participant_photos for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = spotlight_participant_photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "live states owner read" on public.live_screen_states;
create policy "live states owner read"
on public.live_screen_states for select
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = live_screen_states.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "live states owner insert" on public.live_screen_states;
create policy "live states owner insert"
on public.live_screen_states for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = live_screen_states.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "live states owner update" on public.live_screen_states;
create policy "live states owner update"
on public.live_screen_states for update
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = live_screen_states.event_id and events.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = live_screen_states.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "live states owner delete" on public.live_screen_states;
create policy "live states owner delete"
on public.live_screen_states for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = live_screen_states.event_id and events.user_id = auth.uid()
  )
);
