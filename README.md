# ФотоЛови

ФотоЛови — MVP веб-сервиса для мероприятий: ведущий создаёт событие, получает гостевую ссылку и QR-код, гости без регистрации загружают фото, а снимки появляются в гостевой галерее, кабинете ведущего и на live screen для телевизора или проектора.

## Стек

- Next.js App Router, React, TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage
- Vercel для deploy

## Быстрый старт

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` добавлен для будущих server-only операций. В текущем клиентском коде он не используется и не должен попадать в браузер. Никогда не используйте service role key в компонентах с `"use client"`.

## Supabase

1. Создайте проект Supabase.
2. Выполните SQL из `supabase/schema.sql`.
3. Убедитесь, что bucket `event-photos` создан как public.
4. Для удобного MVP-теста можно отключить обязательное email confirmation в Supabase Auth или подтвердить пользователя вручную.

## Структура

- `app` — маршруты Next.js: auth, dashboard, guest page, live screen, admin.
- `components` — UI, layout, event/photo/live компоненты.
- `features` — server actions и queries по доменам.
- `lib` — Supabase clients, constants, utils.
- `types` — типы БД и доменных сущностей.
- `docs` — продуктовая и техническая документация.
- `supabase/schema.sql` — схема БД, RLS и storage policies.

## Что входит в MVP

- Регистрация, вход, выход.
- Защищённый dashboard ведущего.
- Создание мероприятия со slug.
- Гостевая страница `/event/[slug]` без регистрации.
- Загрузка фото в Supabase Storage.
- Запись фото в таблицу `photos`.
- Галерея гостя и ведущего.
- Скрытие и удаление фото ведущим.
- Live screen `/screen/[slug]` с QR и автообновлением.
- Простая admin page через `profiles.role = 'admin'`.
- Credits без платежей: начисление вручную в админке.

## Что не входит в MVP

- Платежи.
- ZIP-скачивание всех фото.
- Лайки, комментарии, голосования.
- AI-функции.
- White label и сложное брендирование.
- Мобильное приложение.

## Deploy на Vercel

1. Подключите репозиторий к Vercel.
2. Добавьте env variables из `.env.example`.
3. Укажите Supabase URL и anon key.
4. Выполните `npm run build` локально перед deploy.
5. После deploy добавьте production URL в `NEXT_PUBLIC_SITE_URL`, если хотите стабильные абсолютные ссылки в QR.

## Ручная проверка

1. Зарегистрироваться.
2. Создать мероприятие.
3. Открыть гостевую ссылку в приватном окне или на телефоне.
4. Загрузить фото.
5. Проверить фото в гостевой галерее.
6. Проверить фото в кабинете ведущего.
7. Открыть live screen и дождаться автообновления.
8. Скрыть фото и убедиться, что оно исчезло из публичных экранов.
9. Удалить фото.

## TODO

- Реализовать ZIP-скачивание всех фото.
- Добавить более строгую server-side валидацию загрузок через signed upload URL.
- Сгенерировать типы Supabase CLI из реальной БД после первого deploy.
- Добавить e2e smoke tests.
