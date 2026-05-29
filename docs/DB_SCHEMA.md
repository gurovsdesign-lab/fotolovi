# DB Schema

## Таблицы

### profiles

- `id uuid primary key references auth.users`
- `email text`
- `full_name text nullable`
- `role text default 'user'`
- `created_at timestamptz`

### events

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `title text`
- `event_date date`
- `slug text unique`
- `is_paid boolean default false`
- `photo_limit integer default 30`
- `created_at timestamptz`
- `updated_at timestamptz`

### photos

- `id uuid primary key`
- `event_id uuid references events(id)`
- `storage_path text`
- `public_url text`
- `is_hidden boolean default false`
- `uploaded_at timestamptz`

### credits

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `amount integer default 0`
- `created_at timestamptz`
- `updated_at timestamptz`

### credit_transactions

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `amount integer`
- `reason text`
- `created_at timestamptz`

### premium_requests

- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `package_id text`
- `package_events integer`
- `package_total_price integer nullable`
- `contact text`
- `preferred_communication text`
- `comment text nullable`
- `status text default 'pending'`
- `processed_at timestamptz nullable`
- `processed_by uuid references profiles(id) nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

## RLS заметки

Базовая RLS находится в `supabase/schema.sql`.

- Пользователь управляет своими events.
- Ведущий управляет photos своих events.
- Гости могут читать публичные events и видимые photos.
- Гости могут загружать photos в существующее мероприятие в пределах `photo_limit`.
- Пользователь создаёт и видит свои premium_requests.
- Admin видит и обрабатывает premium_requests.
- Admin определяется через `profiles.role = 'admin'`.

TODO для production: заменить публичный `select` events на RPC или view с ограниченным набором полей, если появятся приватные поля мероприятия.

## Storage

Bucket: `event-photos`.

Путь: `{eventId}/{timestamp}-{random}.{ext}`.

Bucket public, потому что live screen и гостевая галерея должны быстро показывать фото без signed URL.
