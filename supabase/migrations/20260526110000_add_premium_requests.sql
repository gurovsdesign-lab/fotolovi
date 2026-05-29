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

create index if not exists premium_requests_user_id_idx on public.premium_requests(user_id);
create index if not exists premium_requests_status_created_at_idx on public.premium_requests(status, created_at desc);

drop trigger if exists premium_requests_touch_updated_at on public.premium_requests;
create trigger premium_requests_touch_updated_at
before update on public.premium_requests
for each row execute function public.touch_updated_at();

alter table public.premium_requests enable row level security;

grant select, insert, update on table public.premium_requests to authenticated;
grant select, insert, update on table public.premium_requests to service_role;

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
