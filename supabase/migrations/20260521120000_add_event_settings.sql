alter table public.events
add column if not exists guest_access_code_enabled boolean not null default false;

alter table public.events
add column if not exists guest_access_code text;

alter table public.events
add column if not exists guest_access_mode text not null default 'upload_view_download';

alter table public.events
add column if not exists moderation_mode text not null default 'show_immediately';

update public.events
set guest_access_code_enabled = false
where guest_access_code_enabled is null;

update public.events
set guest_access_mode = 'upload_view_download'
where guest_access_mode is null
   or guest_access_mode not in ('upload_only', 'upload_view', 'upload_view_download');

update public.events
set moderation_mode = 'show_immediately'
where moderation_mode is null
   or moderation_mode not in ('show_immediately', 'premoderation');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_guest_access_code_check'
  ) then
    alter table public.events
    add constraint events_guest_access_code_check
    check (guest_access_code is null or guest_access_code ~ '^[0-9]{4}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'events_guest_access_mode_check'
  ) then
    alter table public.events
    add constraint events_guest_access_mode_check
    check (guest_access_mode in ('upload_only', 'upload_view', 'upload_view_download'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'events_moderation_mode_check'
  ) then
    alter table public.events
    add constraint events_moderation_mode_check
    check (moderation_mode in ('show_immediately', 'premoderation'));
  end if;
end $$;
