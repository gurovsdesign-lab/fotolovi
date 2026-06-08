create table if not exists public.live_screen_launches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists live_screen_launches_event_id_created_at_idx
on public.live_screen_launches(event_id, created_at desc);

create index if not exists live_screen_launches_user_id_created_at_idx
on public.live_screen_launches(user_id, created_at desc);

alter table public.live_screen_launches enable row level security;

grant insert on table public.live_screen_launches to anon, authenticated;
grant select, insert on table public.live_screen_launches to authenticated;
grant select, insert on table public.live_screen_launches to service_role;

drop policy if exists "live screen launches admin read" on public.live_screen_launches;
create policy "live screen launches admin read"
on public.live_screen_launches for select
using (public.is_admin());

drop policy if exists "live screen launches public insert" on public.live_screen_launches;
create policy "live screen launches public insert"
on public.live_screen_launches for insert
with check (
  exists (
    select 1
    from public.events
    where events.id = live_screen_launches.event_id
      and events.user_id = live_screen_launches.user_id
  )
);
