create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  amount integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  event_date date not null,
  slug text not null unique,
  is_paid boolean not null default false,
  photo_limit integer not null default 30,
  guest_access_code_enabled boolean not null default false,
  guest_access_code text check (guest_access_code is null or guest_access_code ~ '^[0-9]{4}$'),
  guest_access_mode text not null default 'upload_view_download' check (guest_access_mode in ('upload_only', 'upload_view', 'upload_view_download')),
  moderation_mode text not null default 'show_immediately' check (moderation_mode in ('show_immediately', 'premoderation')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events
add column if not exists guest_access_code_enabled boolean not null default false;

alter table public.events
add column if not exists guest_access_code text;

alter table public.events
add column if not exists guest_access_mode text not null default 'upload_view_download';

alter table public.events
add column if not exists moderation_mode text not null default 'show_immediately';

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

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  is_hidden boolean not null default false,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.premium_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id text not null,
  package_events integer not null check (package_events > 0),
  package_total_price integer,
  contact text not null,
  preferred_communication text not null,
  comment text,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'canceled')),
  processed_at timestamptz,
  processed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_slug_idx on public.events(slug);
create index if not exists photos_event_id_idx on public.photos(event_id);
create index if not exists credits_user_id_idx on public.credits(user_id);
create index if not exists premium_requests_user_id_idx on public.premium_requests(user_id);
create index if not exists premium_requests_status_created_at_idx on public.premium_requests(status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
before update on public.events
for each row execute function public.touch_updated_at();

drop trigger if exists credits_touch_updated_at on public.credits;
create trigger credits_touch_updated_at
before update on public.credits
for each row execute function public.touch_updated_at();

drop trigger if exists premium_requests_touch_updated_at on public.premium_requests;
create trigger premium_requests_touch_updated_at
before update on public.premium_requests
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  insert into public.credits (user_id, amount)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.debit_current_user_credit(p_reason text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  update public.credits
  set amount = amount - 1
  where user_id = auth.uid()
    and amount > 0;

  if not found then
    return false;
  end if;

  insert into public.credit_transactions (user_id, amount, reason)
  values (auth.uid(), -1, p_reason);

  return true;
end;
$$;

alter table public.profiles enable row level security;
alter table public.credits enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.premium_requests enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update on table public.credits to authenticated;
grant select, insert on table public.credit_transactions to authenticated;
grant select, insert, update on table public.premium_requests to authenticated;
grant select on table public.events to anon, authenticated;
grant select, insert on table public.photos to anon, authenticated;
grant update, delete on table public.photos to authenticated;
grant usage on schema public to service_role;
grant select on table public.profiles to service_role;
grant select, insert, update on table public.credits to service_role;
grant select, insert on table public.credit_transactions to service_role;
grant select, insert, update on table public.premium_requests to service_role;
grant select on table public.events to service_role;
grant select, delete on table public.photos to service_role;
revoke execute on function public.debit_current_user_credit(text) from public;
grant execute on function public.debit_current_user_credit(text) to authenticated;

drop policy if exists "profiles own or admin read" on public.profiles;
create policy "profiles own or admin read"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "credits own or admin read" on public.credits;
create policy "credits own or admin read"
on public.credits for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "credits admin write" on public.credits;
create policy "credits admin write"
on public.credits for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "transactions own or admin read" on public.credit_transactions;
create policy "transactions own or admin read"
on public.credit_transactions for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "transactions authenticated insert own" on public.credit_transactions;
create policy "transactions authenticated insert own"
on public.credit_transactions for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "premium requests own or admin read" on public.premium_requests;
create policy "premium requests own or admin read"
on public.premium_requests for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "premium requests owner insert" on public.premium_requests;
create policy "premium requests owner insert"
on public.premium_requests for insert
with check (user_id = auth.uid());

drop policy if exists "premium requests admin update" on public.premium_requests;
create policy "premium requests admin update"
on public.premium_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "events owner insert" on public.events;
create policy "events owner insert"
on public.events for insert
with check (user_id = auth.uid());

drop policy if exists "events owner update" on public.events;
create policy "events owner update"
on public.events for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "events owner delete" on public.events;
create policy "events owner delete"
on public.events for delete
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "events public read" on public.events;
create policy "events public read"
on public.events for select
using (true);

drop policy if exists "photos public read visible" on public.photos;
create policy "photos public read visible"
on public.photos for select
using (
  is_hidden = false
  or public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "photos public insert" on public.photos;
create policy "photos public insert"
on public.photos for insert
with check (
  exists (select 1 from public.events where events.id = photos.event_id)
  and (
    select count(*) from public.photos existing
    where existing.event_id = photos.event_id
  ) < (
    select events.photo_limit from public.events
    where events.id = photos.event_id
  )
);

drop policy if exists "photos owner update" on public.photos;
create policy "photos owner update"
on public.photos for update
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = photos.event_id and events.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = photos.event_id and events.user_id = auth.uid()
  )
);

drop policy if exists "photos owner delete" on public.photos;
create policy "photos owner delete"
on public.photos for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.events
    where events.id = photos.event_id and events.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
set public = true,
    file_size_limit = 12582912,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

drop policy if exists "event photos public read" on storage.objects;
create policy "event photos public read"
on storage.objects for select
using (bucket_id = 'event-photos');

drop policy if exists "event photos public upload" on storage.objects;
create policy "event photos public upload"
on storage.objects for insert
with check (bucket_id = 'event-photos');

drop policy if exists "event photos owner delete" on storage.objects;
create policy "event photos owner delete"
on storage.objects for delete
using (
  bucket_id = 'event-photos'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.photos
      join public.events on events.id = photos.event_id
      where photos.storage_path = storage.objects.name
      and events.user_id = auth.uid()
    )
  )
);
