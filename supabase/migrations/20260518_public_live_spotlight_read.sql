grant select on table public.live_screen_states to anon;
grant select on table public.spotlight_participants to anon;
grant select on table public.spotlight_participant_photos to anon;

drop policy if exists "live states public read" on public.live_screen_states;
create policy "live states public read"
on public.live_screen_states for select
using (true);

drop policy if exists "spotlight participants active public read" on public.spotlight_participants;
create policy "spotlight participants active public read"
on public.spotlight_participants for select
using (
  exists (
    select 1
    from public.live_screen_states
    where live_screen_states.event_id = spotlight_participants.event_id
      and live_screen_states.mode = 'spotlight'
      and live_screen_states.active_participant_id = spotlight_participants.id
  )
);

drop policy if exists "spotlight photos active public read" on public.spotlight_participant_photos;
create policy "spotlight photos active public read"
on public.spotlight_participant_photos for select
using (
  exists (
    select 1
    from public.live_screen_states
    where live_screen_states.event_id = spotlight_participant_photos.event_id
      and live_screen_states.mode = 'spotlight'
      and live_screen_states.active_participant_id = spotlight_participant_photos.participant_id
  )
);
