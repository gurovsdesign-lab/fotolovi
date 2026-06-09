export type MarketingRoute = {
  title: string;
  path: string;
  parentPath: string | null;
  level: number;
  pageType: string;
  intent: string;
  priority: "P0" | "P1" | "P2";
};

export type MarketingLink = {
  from: string;
  to: string;
  reason: string;
};

export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.fotolovi.ru";

export const PRODUCT_ROUTE_PREFIXES = [
  "/api",
  "/admin",
  "/auth",
  "/dashboard",
  "/event",
  "/live",
  "/login",
  "/register",
] as const;

export const PRODUCT_DYNAMIC_PREFIXES = ["/screen"] as const;

export const MARKETING_ROUTES: MarketingRoute[] = [
  {
    title: "Главная",
    path: "/",
    parentPath: null,
    level: 0,
    pageType: "главная страница",
    intent: "Вход в продукт FotoLovi как экосистему свадебных и мероприятие-медиа",
    priority: "P0",
  },
  {
    title: "Свадебный хаб",
    path: "/wedding/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Решения для свадьбы: собрать фото гостей, показать их на экране и сохранить общую галерею",
    priority: "P0",
  },
  {
    title: "QR-альбом для свадьбы",
    path: "/wedding/qr-photo-album/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "QR-альбом, куда гости загружают свадебные фото",
    priority: "P0",
  },
  {
    title: "Фото гостей на свадьбе",
    path: "/wedding/guest-photos/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Собрать фото гостей на свадьбе",
    priority: "P0",
  },
  {
    title: "Как собрать фото после свадьбы",
    path: "/wedding/collect-photos-after-wedding/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "контентная коммерческая страница",
    intent: "Как собрать фото после свадьбы у гостей",
    priority: "P1",
  },
  {
    title: "Общий свадебный альбом",
    path: "/wedding/shared-album/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Общий альбом свадьбы для гостей",
    priority: "P1",
  },
  {
    title: "Свадебные интерактивы",
    path: "/wedding/interactive/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "хаб-контент",
    intent: "Интерактивы на свадьбу с участием гостей",
    priority: "P1",
  },
  {
    title: "Современная свадьба",
    path: "/wedding/modern/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "контентный хаб",
    intent: "Современные идеи свадьбы",
    priority: "P1",
  },
  {
    title: "Цифровая свадьба",
    path: "/wedding/digital/",
    parentPath: "/wedding/modern/",
    level: 3,
    pageType: "контентная коммерческая страница",
    intent: "Цифровые инструменты для свадьбы",
    priority: "P1",
  },
  {
    title: "Тренды свадеб",
    path: "/wedding/trends/",
    parentPath: "/wedding/modern/",
    level: 3,
    pageType: "контентный хаб",
    intent: "Свадебные тренды и форматы",
    priority: "P2",
  },
  {
    title: "Свадьба 2026",
    path: "/wedding/2026/",
    parentPath: "/wedding/trends/",
    level: 4,
    pageType: "сезонная контентная страница",
    intent: "Идеи и цифровые тренды свадьбы 2026",
    priority: "P2",
  },
  {
    title: "Wow-эффекты на свадьбе",
    path: "/wedding/wow-effects/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "визуальная контентная страница",
    intent: "Чем удивить гостей на свадьбе",
    priority: "P2",
  },
  {
    title: "Свадебный приветственный сценарий",
    path: "/wedding/welcome/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "визуальный хаб",
    intent: "Приветственный сценарий на свадьбе",
    priority: "P1",
  },
  {
    title: "Приветственный экран на свадьбе",
    path: "/wedding/welcome-screen/",
    parentPath: "/wedding/welcome/",
    level: 3,
    pageType: "визуальная контентная коммерческая страница",
    intent: "Приветственный экран для гостей",
    priority: "P2",
  },
  {
    title: "Приветственная зона на свадьбе",
    path: "/wedding/welcome-zone/",
    parentPath: "/wedding/welcome/",
    level: 3,
    pageType: "визуальная контентная страница",
    intent: "Идеи приветственной зоны на свадьбе",
    priority: "P2",
  },
  {
    title: "Таблички с QR для свадьбы",
    path: "/wedding/welcome-signs/",
    parentPath: "/wedding/welcome/",
    level: 3,
    pageType: "визуальная поддерживающая страница",
    intent: "QR-таблички и приветственные QR-таблички для гостей",
    priority: "P2",
  },
  {
    title: "Экран и проектор на свадьбе",
    path: "/wedding/projector-screen/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Показать фото гостей на экране или проекторе",
    priority: "P0",
  },
  {
    title: "Контент для свадебного экрана",
    path: "/wedding/screen-content/",
    parentPath: "/wedding/projector-screen/",
    level: 3,
    pageType: "контентная коммерческая страница",
    intent: "Что показывать на свадебном экране",
    priority: "P1",
  },
  {
    title: "Альтернатива фотобудке на свадьбе",
    path: "/wedding/photo-booth-alternative/",
    parentPath: "/wedding/",
    level: 2,
    pageType: "сравнение коммерческая страница",
    intent: "Чем заменить фотобудку на свадьбе",
    priority: "P1",
  },
  {
    title: "QR-хаб",
    path: "/qr/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "QR для загрузки фото гостями",
    priority: "P1",
  },
  {
    title: "QR-код для свадьбы",
    path: "/qr/wedding/",
    parentPath: "/qr/",
    level: 2,
    pageType: "коммерческая поддерживающая страница",
    intent: "QR-код для свадебных фото",
    priority: "P1",
  },
  {
    title: "QR-код для гостей",
    path: "/qr/guests/",
    parentPath: "/qr/",
    level: 2,
    pageType: "контент коммерческая страница",
    intent: "QR-код, по которому гости загружают фото",
    priority: "P1",
  },
  {
    title: "QR без приложения",
    path: "/qr/no-app/",
    parentPath: "/qr/",
    level: 2,
    pageType: "семантическая поддерживающая страница",
    intent: "QR-загрузка фото без приложения",
    priority: "P1",
  },
  {
    title: "Фото-хаб",
    path: "/photo/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Фото гостей как эмоциональное ядро FotoLovi",
    priority: "P0",
  },
  {
    title: "Сбор фото гостей",
    path: "/photo/guest-photo-collection/",
    parentPath: "/photo/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Собрать фото от гостей",
    priority: "P0",
  },
  {
    title: "Фото гостей",
    path: "/photo/guest-photos/",
    parentPath: "/photo/",
    level: 2,
    pageType: "контентная коммерческая страница",
    intent: "Фото гостей как отдельная ценность события",
    priority: "P1",
  },
  {
    title: "Общий фотоальбом",
    path: "/photo/shared-album/",
    parentPath: "/photo/",
    level: 2,
    pageType: "коммерческая поддерживающая страница",
    intent: "Общий альбом для гостей события",
    priority: "P1",
  },
  {
    title: "Как собрать фото гостей",
    path: "/photo/how-to-collect/",
    parentPath: "/photo/",
    level: 2,
    pageType: "информационная коммерческая страница",
    intent: "Как собрать фото гостей с мероприятия",
    priority: "P1",
  },
  {
    title: "Живая галерея",
    path: "/photo/live-gallery/",
    parentPath: "/photo/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Живая галерея фото гостей",
    priority: "P1",
  },
  {
    title: "Фотостена в реальном времени",
    path: "/photo/live-photo-wall/",
    parentPath: "/photo/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Фото гостей на экране в реальном времени",
    priority: "P0",
  },
  {
    title: "Воспоминания гостей",
    path: "/photo/memories/",
    parentPath: "/photo/",
    level: 2,
    pageType: "эмоциональная контентная страница",
    intent: "Сохранить воспоминания гостей с события",
    priority: "P1",
  },
  {
    title: "Без приложения",
    path: "/no-app/",
    parentPath: "/",
    level: 1,
    pageType: "продуктовый хаб",
    intent: "Загрузка фото гостями без установки приложения",
    priority: "P1",
  },
  {
    title: "Загрузка фото без приложения",
    path: "/no-app/photo-upload/",
    parentPath: "/no-app/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Гость загружает фото через браузер без установки",
    priority: "P1",
  },
  {
    title: "Загрузка без регистрации",
    path: "/no-app/guest-upload-without-registration/",
    parentPath: "/no-app/",
    level: 2,
    pageType: "поддерживающая страница",
    intent: "Загрузка фото гостями без регистрации",
    priority: "P2",
  },
  {
    title: "Загрузка через браузер",
    path: "/photo/browser-upload/",
    parentPath: "/no-app/",
    level: 2,
    pageType: "поддерживающая страница",
    intent: "Загрузка фото в браузере телефона",
    priority: "P2",
  },
  {
    title: "Экранный хаб",
    path: "/screen/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Экран и проектор для фото гостей",
    priority: "P1",
  },
  {
    title: "Что показывать на свадебном проекторе",
    path: "/screen/what-to-show-on-wedding-projector/",
    parentPath: "/screen/",
    level: 2,
    pageType: "контентная коммерческая страница",
    intent: "Что показывать на проекторе на свадьбе",
    priority: "P1",
  },
  {
    title: "Идеи свадебного экрана",
    path: "/screen/wedding-screen-ideas/",
    parentPath: "/screen/",
    level: 2,
    pageType: "визуальная контентная страница",
    intent: "Идеи экрана для свадьбы",
    priority: "P2",
  },
  {
    title: "Хаб для ведущих",
    path: "/hosts/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Инструменты FotoLovi для ведущих",
    priority: "P1",
  },
  {
    title: "Интерактивы для ведущих",
    path: "/hosts/interactives/",
    parentPath: "/hosts/",
    level: 2,
    pageType: "контентная коммерческая страница",
    intent: "Интерактивы ведущего с фото гостей",
    priority: "P1",
  },
  {
    title: "Экран для ведущих",
    path: "/hosts/screen/",
    parentPath: "/hosts/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Экран ведущего для фото гостей",
    priority: "P1",
  },
  {
    title: "Мероприятия",
    path: "/events/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Фото-галерея для разных типов мероприятий",
    priority: "P1",
  },
  {
    title: "Фото-галерея мероприятия",
    path: "/events/photo-gallery/",
    parentPath: "/events/",
    level: 2,
    pageType: "коммерческая страница",
    intent: "Онлайн фото-галерея мероприятия",
    priority: "P1",
  },
  {
    title: "Корпоративные мероприятия",
    path: "/events/corporate/",
    parentPath: "/events/",
    level: 2,
    pageType: "поддерживающая страница",
    intent: "Фото гостей на корпоративных мероприятиях",
    priority: "P2",
  },
  {
    title: "Альтернативы",
    path: "/alternatives/",
    parentPath: "/",
    level: 1,
    pageType: "сравнительный хаб",
    intent: "Сравнить FotoLovi с привычными способами сбора фото",
    priority: "P1",
  },
  {
    title: "Альтернатива фотобудке",
    path: "/alternatives/photo-booth/",
    parentPath: "/alternatives/",
    level: 2,
    pageType: "сравнительная страница",
    intent: "Альтернатива фотобудке для события",
    priority: "P1",
  },
  {
    title: "Альтернатива Google Drive и Telegram",
    path: "/alternatives/google-drive-telegram/",
    parentPath: "/alternatives/",
    level: 2,
    pageType: "сравнительная страница",
    intent: "Сравнить сбор фото через облака, чаты и FotoLovi",
    priority: "P1",
  },
  {
    title: "Идеи",
    path: "/ideas/",
    parentPath: "/",
    level: 1,
    pageType: "идейный хаб",
    intent: "Идеи для гостей и визуального опыта события",
    priority: "P2",
  },
  {
    title: "Идеи для свадьбы",
    path: "/ideas/wedding/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "контентная страница",
    intent: "Идеи цифрового опыта для свадьбы",
    priority: "P2",
  },
  {
    title: "Интерактивные идеи",
    path: "/ideas/interactive/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "контентная страница",
    intent: "Интерактивные идеи для гостей",
    priority: "P2",
  },
  {
    title: "Идеи для проектора",
    path: "/ideas/projector/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "контентная страница",
    intent: "Идеи контента для проектора",
    priority: "P2",
  },
  {
    title: "Wow-эффекты",
    path: "/ideas/wow-effects/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "контентная страница",
    intent: "Wow-эффекты для гостей",
    priority: "P2",
  },
  {
    title: "Развлечения для гостей",
    path: "/ideas/guest-entertainment/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "контентная страница",
    intent: "Развлечения гостей через фото",
    priority: "P2",
  },
  {
    title: "Визуальные идеи свадьбы",
    path: "/ideas/wedding-visuals/",
    parentPath: "/ideas/",
    level: 2,
    pageType: "визуальная контентная страница",
    intent: "Визуальные идеи для свадебного экрана и QR-зоны",
    priority: "P2",
  },
  {
    title: "Вовлечение гостей",
    path: "/engagement/",
    parentPath: "/",
    level: 1,
    pageType: "хаб",
    intent: "Вовлечение гостей через фото-активности",
    priority: "P2",
  },
  {
    title: "Голосования и конкурсы",
    path: "/engagement/voting-contests/",
    parentPath: "/engagement/",
    level: 2,
    pageType: "поддерживающая страница",
    intent: "Фото-голосования и конкурсы для гостей",
    priority: "P2",
  },
];

export const MARKETING_INTERNAL_LINKS: MarketingLink[] = [
  { from: "/", to: "/wedding/", reason: "Передать главный вес в свадебный кластер." },
  { from: "/", to: "/photo/", reason: "Показать фото как эмоциональное ядро FotoLovi." },
  { from: "/", to: "/no-app/", reason: "Вынести ключевое отличие: загрузка без приложения." },
  { from: "/", to: "/wedding/qr-photo-album/", reason: "Короткий путь к свадебной QR-странице." },
  { from: "/wedding/", to: "/wedding/guest-photos/", reason: "Перевести свадебный спрос в фото гостей." },
  { from: "/wedding/", to: "/wedding/qr-photo-album/", reason: "Связать свадебный хаб с QR-альбомом." },
  { from: "/wedding/", to: "/wedding/projector-screen/", reason: "Передать пользователей в экранный сценарий." },
  { from: "/wedding/", to: "/wedding/interactive/", reason: "Направить вдохновляющий трафик в интерактивы." },
  { from: "/wedding/", to: "/wedding/modern/", reason: "Поднять слой современной свадьбы." },
  { from: "/wedding/", to: "/wedding/welcome/", reason: "Выделить приветственный сценарий как визуальный кластер." },
  { from: "/wedding/modern/", to: "/wedding/digital/", reason: "Перевести широкий современный интент в цифровые инструменты." },
  { from: "/wedding/modern/", to: "/wedding/trends/", reason: "Развить сезонный и трендовый авторитет." },
  { from: "/wedding/trends/", to: "/wedding/2026/", reason: "Создать ежегодный слой для сезонного длинного хвоста." },
  { from: "/wedding/trends/", to: "/wedding/qr-photo-album/", reason: "Передать авторитет от трендов в QR-альбом." },
  { from: "/wedding/2026/", to: "/wedding/digital/", reason: "Связать тренды 2026 с цифровой свадьбой." },
  { from: "/wedding/digital/", to: "/wedding/qr-photo-album/", reason: "Конвертировать цифровой свадебный поиск в QR-альбом." },
  { from: "/wedding/digital/", to: "/photo/guest-photo-collection/", reason: "Связать цифровую свадьбу со сбором фото гостей." },
  { from: "/wedding/interactive/", to: "/photo/live-photo-wall/", reason: "Конвертировать интерактивы в фотостену." },
  { from: "/wedding/interactive/", to: "/wedding/qr-photo-album/", reason: "Показать QR-альбом как простой интерактив." },
  { from: "/wedding/interactive/", to: "/hosts/interactives/", reason: "Связать свадебный и ведущий-сценарии." },
  { from: "/wedding/welcome/", to: "/wedding/welcome-zone/", reason: "Развести приветственный хаб и визуальные идеи." },
  { from: "/wedding/welcome/", to: "/wedding/welcome-screen/", reason: "Передать экранный интент в отдельную страницу." },
  { from: "/wedding/welcome/", to: "/wedding/welcome-signs/", reason: "Передать намерение QR-табличек." },
  { from: "/wedding/welcome/", to: "/wedding/qr-photo-album/", reason: "Сделать QR-альбом целью конверсии приветственного кластера." },
  { from: "/wedding/projector-screen/", to: "/photo/live-photo-wall/", reason: "Перевести проекторный спрос в фотостену." },
  { from: "/wedding/projector-screen/", to: "/wedding/screen-content/", reason: "Дать контентные сценарии для экрана." },
  { from: "/qr/", to: "/qr/wedding/", reason: "Направить свадебный QR-интент." },
  { from: "/qr/", to: "/qr/guests/", reason: "Направить широкий гостевой QR-интент." },
  { from: "/qr/", to: "/qr/no-app/", reason: "Связать QR с загрузкой без приложения." },
  { from: "/qr/wedding/", to: "/wedding/qr-photo-album/", reason: "Отдать конверсию в свадебный QR-альбом." },
  { from: "/qr/guests/", to: "/photo/guest-photo-collection/", reason: "Вести QR гостей в сбор фото." },
  { from: "/photo/", to: "/photo/guest-photo-collection/", reason: "Главный коммерческий путь фото-кластера." },
  { from: "/photo/", to: "/photo/live-gallery/", reason: "Связать фото с живой галереей." },
  { from: "/photo/", to: "/photo/live-photo-wall/", reason: "Связать фото с экранным сценарием." },
  { from: "/photo/live-gallery/", to: "/screen/", reason: "Показать развитие галереи в экран." },
  { from: "/photo/live-photo-wall/", to: "/screen/wedding-screen-ideas/", reason: "Передать экранный визуальный интент." },
  { from: "/no-app/", to: "/no-app/photo-upload/", reason: "Главная страница механики без приложения." },
  { from: "/no-app/", to: "/qr/no-app/", reason: "Связать без приложения с QR-кластером." },
  { from: "/screen/", to: "/screen/what-to-show-on-wedding-projector/", reason: "Закрыть вопросный экранный интент." },
  { from: "/screen/", to: "/screen/wedding-screen-ideas/", reason: "Показать визуальные идеи для экрана." },
  { from: "/hosts/", to: "/hosts/interactives/", reason: "Передать ведущих в интерактивы." },
  { from: "/hosts/", to: "/hosts/screen/", reason: "Передать ведущих в экранный сценарий." },
  { from: "/events/", to: "/events/photo-gallery/", reason: "Направить в галерею мероприятия." },
  { from: "/alternatives/", to: "/alternatives/photo-booth/", reason: "Сравнение с фотобудкой." },
  { from: "/alternatives/", to: "/alternatives/google-drive-telegram/", reason: "Сравнение с облаками и чатами." },
  { from: "/ideas/", to: "/ideas/wedding/", reason: "Вход в свадебные идеи." },
  { from: "/ideas/", to: "/ideas/interactive/", reason: "Вход в интерактивные идеи." },
  { from: "/ideas/", to: "/ideas/projector/", reason: "Вход в идеи для проектора." },
  { from: "/ideas/", to: "/ideas/wow-effects/", reason: "Вход в wow-эффекты." },
  { from: "/ideas/wedding/", to: "/wedding/modern/", reason: "Связать идеи с современной свадьбой." },
  { from: "/ideas/interactive/", to: "/photo/live-photo-wall/", reason: "Связать интерактивы с фотостеной." },
  { from: "/ideas/projector/", to: "/screen/what-to-show-on-wedding-projector/", reason: "Связать идеи проектора с экранным интентом." },
  { from: "/ideas/wow-effects/", to: "/wedding/wow-effects/", reason: "Связать общий wow-интент со свадебным." },
];

export function normalizeMarketingPath(path: string) {
  if (path === "") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function getMarketingRoute(path: string) {
  const normalizedPath = normalizeMarketingPath(path);
  return MARKETING_ROUTES.find((route) => route.path === normalizedPath) ?? null;
}

export function getMarketingChildren(path: string) {
  const normalizedPath = normalizeMarketingPath(path);
  return MARKETING_ROUTES.filter((route) => route.parentPath === normalizedPath);
}

export function getMarketingParent(route: MarketingRoute) {
  return route.parentPath ? getMarketingRoute(route.parentPath) : null;
}

export function getMarketingRelatedRoutes(path: string) {
  const normalizedPath = normalizeMarketingPath(path);
  const directTargets = MARKETING_INTERNAL_LINKS.filter((link) => link.from === normalizedPath)
    .map((link) => getMarketingRoute(link.to))
    .filter((route): route is MarketingRoute => Boolean(route));
  const children = getMarketingChildren(normalizedPath);
  const parent = getMarketingRoute(normalizedPath);
  const parentRoute = parent ? getMarketingParent(parent) : null;
  const routes = [...directTargets, ...children, ...(parentRoute ? [parentRoute] : [])];

  return routes.filter((route, index) => routes.findIndex((item) => item.path === route.path) === index);
}

export function getMarketingPathFromSegments(segments?: string[]) {
  if (!segments?.length) return "/";
  return normalizeMarketingPath(segments.join("/"));
}

export function getMarketingHref(path: string) {
  const normalizedPath = normalizeMarketingPath(path);
  return normalizedPath === "/" ? "/" : normalizedPath.replace(/\/$/, "");
}

export function getMarketingUrl(path: string) {
  return `${SITE_ORIGIN}${getMarketingHref(path)}`;
}
