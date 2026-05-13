"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { LIVE_REFRESH_MS } from "@/lib/constants";
import type { LiveScreenEvent, LiveScreenPhoto } from "@/types/live";
import { LiveEmptyState } from "./LiveEmptyState";

const CENTER_PHOTO_INTERVAL_MS = 4500;
const SIDE_SEQUENCE_LENGTH = 9;
const SIDE_VISIBLE_SLOTS_PER_COLUMN = 5;
const SIDE_FULL_REAL_PHOTO_COUNT = SIDE_VISIBLE_SLOTS_PER_COLUMN * 2;

type SideItem =
  | {
      type: "photo";
      id: string;
      publicUrl: string;
    }
  | {
      type: "placeholder";
      id: string;
      className: string;
    };

const placeholderStyles = [
  "bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))]",
  "bg-[linear-gradient(145deg,rgba(214,179,106,0.14),rgba(255,255,255,0.05)_42%,rgba(255,255,255,0.02))]",
  "bg-[radial-gradient(circle_at_70%_18%,rgba(214,179,106,0.16),transparent_30%),linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(214,179,106,0.08)_48%,rgba(255,255,255,0.02))]",
];

const sideAspectClasses = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[5/4]",
  "aspect-[3/4]",
  "aspect-square",
];

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
  const [centerPhotoIndex, setCenterPhotoIndex] = useState(0);

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
  const centerPhoto = visiblePhotos.length
    ? visiblePhotos[centerPhotoIndex % visiblePhotos.length]
    : null;
  const leftColumnItems = useMemo(() => createSideItems(visiblePhotos, "left"), [visiblePhotos]);
  const rightColumnItems = useMemo(() => createSideItems(visiblePhotos, "right"), [visiblePhotos]);

  useEffect(() => {
    if (visiblePhotos.length <= 1) {
      setCenterPhotoIndex(0);
      return;
    }

    const rotation = window.setInterval(() => {
      setCenterPhotoIndex((currentIndex) => (currentIndex + 1) % visiblePhotos.length);
    }, CENTER_PHOTO_INTERVAL_MS);

    return () => window.clearInterval(rotation);
  }, [visiblePhotos.length]);

  if (!visiblePhotos.length || !centerPhoto) {
    return <LiveEmptyState guestUrl={guestUrl} title={event.title} />;
  }

  return (
    <div className="relative h-screen overflow-hidden bg-night text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(214,179,106,0.18),transparent_34rem)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(18,18,18,0.48)_24%,rgba(18,18,18,0.7)_100%)]" />

      <header className="relative z-20 px-5 pb-1 pt-7 text-center sm:px-8 lg:px-12">
        <h1 className="mx-auto max-w-[92vw] truncate py-2 font-display text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.12] text-white">
          {event.title}
        </h1>
      </header>

      <main className="relative z-10 h-[calc(100vh-5.8rem)] overflow-hidden px-4 pb-16 sm:px-8 lg:px-12">
        <SideColumn items={leftColumnItems} direction="down" position="left" />
        <SideColumn items={rightColumnItems} direction="up" position="right" />

        <section className="relative z-10 grid h-full place-items-center">
          <div className="live-main-glow relative isolate">
            <figure className="relative z-10 aspect-[4/5] w-[min(74vw,28rem)] max-h-[calc(100vh-13rem)] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_24px_90px_rgba(0,0,0,0.52)] sm:h-[min(66vh,46rem)] sm:w-auto">
              <Image
                key={centerPhoto.id}
                src={centerPhoto.public_url}
                alt="Фото мероприятия"
                fill
                priority
                className="animate-live-main-photo object-cover"
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 36vw"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </figure>
          </div>
        </section>

      </main>

      <div className="pointer-events-auto absolute bottom-5 right-4 z-50 hidden shrink-0 isolate items-center gap-4 rounded-lg border border-white/10 bg-night p-3 shadow-[0_18px_80px_rgba(0,0,0,0.58)] md:flex lg:bottom-7 lg:right-12">
        <div className="rounded-md bg-white p-2">
          <QRCodeCanvas value={guestUrl} size={92} marginSize={1} />
        </div>
        <div className="pr-2">
          <p className="text-lg font-semibold">Сканируйте QR</p>
          <p className="mt-1 text-sm text-white/60">Фото появятся здесь</p>
        </div>
      </div>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end bg-gradient-to-t from-night via-night/80 to-transparent px-5 pb-7 pt-24 sm:px-8 lg:px-12">
        <p className="text-lg font-medium text-white/80">{visiblePhotos.length} фото в эфире</p>
      </footer>
    </div>
  );
}

function SideColumn({
  items,
  direction,
  position,
}: {
  items: SideItem[];
  direction: "up" | "down";
  position: "left" | "right";
}) {
  const repeatedItems = [...items, ...items];
  const animationClass =
    direction === "down" ? "animate-live-column-down" : "animate-live-column-up";
  const positionClass =
    position === "left"
      ? "left-3 sm:left-6 lg:left-10"
      : "right-3 sm:right-6 lg:right-10";

  return (
    <aside
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-8 top-7 z-0 w-[clamp(4.6rem,14vw,14rem)] overflow-hidden sm:top-10 ${positionClass}`}
    >
      <div className={`flex flex-col gap-4 will-change-transform sm:gap-5 ${animationClass}`}>
        {repeatedItems.map((item, index) => (
          <SideTile key={`${item.id}-${index}`} item={item} index={index} />
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 z-10 h-[38%] bg-gradient-to-b from-night via-night/95 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-[38%] bg-gradient-to-t from-night via-night/95 to-transparent" />
    </aside>
  );
}

function SideTile({ item, index }: { item: SideItem; index: number }) {
  const aspectClass = sideAspectClasses[index % sideAspectClasses.length];

  if (item.type === "placeholder") {
    return (
      <div
        data-live-side-item="placeholder"
        className={`relative shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.34)] ${aspectClass} ${item.className}`}
      >
        <div className="absolute inset-0 bg-black/10 ring-1 ring-inset ring-white/10" />
      </div>
    );
  }

  return (
    <figure
      data-live-side-item="photo"
      className={`relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-[0_18px_70px_rgba(0,0,0,0.34)] ${aspectClass}`}
    >
      <Image
        src={item.publicUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 640px) 18vw, (max-width: 1024px) 16vw, 14vw"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
    </figure>
  );
}

function createSideItems(photos: LiveScreenPhoto[], side: "left" | "right"): SideItem[] {
  if (photos.length >= SIDE_FULL_REAL_PHOTO_COUNT) {
    const startIndex = side === "left" ? 0 : SIDE_VISIBLE_SLOTS_PER_COLUMN;

    return Array.from({ length: SIDE_VISIBLE_SLOTS_PER_COLUMN }, (_, index) => {
      const photo = photos[startIndex + index];

      return {
        type: "photo",
        id: `${photo.id}-${side}-${index}`,
        publicUrl: photo.public_url,
      };
    });
  }

  const items: SideItem[] = Array.from({ length: SIDE_SEQUENCE_LENGTH }, (_, index) => ({
    type: "placeholder",
    id: `placeholder-${side}-${index}`,
    className: placeholderStyles[(index + (side === "left" ? 0 : 2)) % placeholderStyles.length],
  }));
  const sidePhotos = photos.filter((_, index) =>
    side === "left" ? index % 2 === 0 : index % 2 === 1,
  );
  const photoSlots = [1, 4, 7, 2, 6];

  sidePhotos.slice(0, SIDE_VISIBLE_SLOTS_PER_COLUMN).forEach((photo, index) => {
    const slotIndex = photoSlots[index];

    items[slotIndex] = {
      type: "photo",
      id: `${photo.id}-${side}-${slotIndex}`,
      publicUrl: photo.public_url,
    };
  });

  return items;
}
