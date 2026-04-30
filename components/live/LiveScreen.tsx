"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { LIVE_REFRESH_MS } from "@/lib/constants";
import type { LiveScreenEvent, LiveScreenPhoto } from "@/types/live";
import { LiveEmptyState } from "./LiveEmptyState";

export function LiveScreen({
  event,
  initialPhotos,
  guestUrl,
}: {
  event: LiveScreenEvent;
  initialPhotos: LiveScreenPhoto[];
  guestUrl: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  useEffect(() => {
    const fetchPhotos = async () => {
      const response = await fetch(`/api/events/${event.slug}/photos`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { photos: LiveScreenPhoto[] };
      setPhotos(payload.photos);
    };

    const refresh = window.setInterval(fetchPhotos, LIVE_REFRESH_MS);
    return () => window.clearInterval(refresh);
  }, [event.slug]);

  const visiblePhotos = useMemo(() => photos, [photos]);

  if (!visiblePhotos.length) {
    return <LiveEmptyState guestUrl={guestUrl} title={event.title} />;
  }

  return (
    <div className="relative h-screen overflow-hidden bg-night text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(214,179,106,0.18),transparent_34rem)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(18,18,18,0.48)_24%,rgba(18,18,18,0.7)_100%)]" />

      <header className="relative z-10 flex items-start justify-between gap-8 px-8 py-7 lg:px-12">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-gold/90">
            Live photo wall
          </p>
          <h1 className="mt-3 max-w-[72vw] truncate font-display text-5xl leading-none text-white sm:text-7xl lg:text-8xl">
            {event.title}
          </h1>
        </div>
        <div className="hidden shrink-0 items-center gap-4 rounded-lg border border-white/10 bg-black/35 p-3 backdrop-blur md:flex">
          <div className="rounded-md bg-white p-2">
            <QRCodeCanvas value={guestUrl} size={92} marginSize={1} />
          </div>
          <div className="pr-2">
            <p className="text-lg font-semibold">Сканируйте QR</p>
            <p className="mt-1 text-sm text-white/60">Фото появятся здесь</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100vh-150px)] overflow-hidden px-5 pb-7 sm:px-8 lg:h-[calc(100vh-180px)] lg:px-12">
        <div className="h-full columns-2 gap-3 [column-fill:balance] sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
          {visiblePhotos.map((photo, index) => {
            const aspectClass = getMasonryAspectClass(index);

            return (
              <figure
                key={photo.id}
                className={`relative mb-3 break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_18px_70px_rgba(0,0,0,0.34)] ${aspectClass}`}
              >
                <Image
                  src={photo.public_url}
                  alt="Фото мероприятия"
                  fill
                  priority={index < 8}
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </figure>
            );
          })}
        </div>
      </main>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between bg-gradient-to-t from-night via-night/80 to-transparent px-8 pb-7 pt-24 lg:px-12">
        <p className="text-lg font-medium text-white/80">{visiblePhotos.length} фото в эфире</p>
        <p className="hidden text-lg text-white/50 sm:block">Автообновление каждые 5 секунд</p>
      </footer>
    </div>
  );
}

function getMasonryAspectClass(index: number) {
  const pattern = [
    "aspect-[4/5]",
    "aspect-square",
    "aspect-[3/4]",
    "aspect-[5/4]",
    "aspect-[4/3]",
    "aspect-[3/5]",
    "aspect-square",
    "aspect-[4/5]",
  ];

  return pattern[index % pattern.length];
}
