"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { LIVE_REFRESH_MS } from "@/lib/constants";
import type { LiveScreenEvent, LiveScreenPhoto } from "@/types/live";
import { LiveEmptyState } from "./LiveEmptyState";

const CENTER_PHOTO_INTERVAL_MS = 4500;
const CENTER_PHOTO_TRANSITION_MS = 900;
const SIDE_SEQUENCE_LENGTH = 7;
const SIDE_REAL_ONLY_PHOTO_COUNT = 8;

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
  "bg-[linear-gradient(145deg,rgba(255,255,255,0.072),rgba(255,255,255,0.032))]",
  "bg-[linear-gradient(145deg,rgba(255,255,255,0.056),rgba(214,179,106,0.034))]",
  "bg-[linear-gradient(160deg,rgba(255,255,255,0.064),rgba(255,255,255,0.028))]",
  "bg-[linear-gradient(135deg,rgba(214,179,106,0.044),rgba(255,255,255,0.03))]",
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
  const [displayedCenterPhoto, setDisplayedCenterPhoto] = useState<LiveScreenPhoto | null>(
    initialPhotos[0] ?? null,
  );
  const [incomingCenterPhoto, setIncomingCenterPhoto] = useState<LiveScreenPhoto | null>(null);
  const [isIncomingCenterPhotoReady, setIsIncomingCenterPhotoReady] = useState(false);

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

  useEffect(() => {
    if (!centerPhoto) return;

    if (!displayedCenterPhoto) {
      setDisplayedCenterPhoto(centerPhoto);
      setIncomingCenterPhoto(null);
      setIsIncomingCenterPhotoReady(false);
      return;
    }

    if (
      centerPhoto.id === displayedCenterPhoto.id ||
      centerPhoto.id === incomingCenterPhoto?.id
    ) {
      return;
    }

    setIncomingCenterPhoto(centerPhoto);
    setIsIncomingCenterPhotoReady(false);
  }, [centerPhoto, displayedCenterPhoto, incomingCenterPhoto?.id]);

  useEffect(() => {
    if (!incomingCenterPhoto || !isIncomingCenterPhotoReady) return;

    const swap = window.setTimeout(() => {
      setDisplayedCenterPhoto(incomingCenterPhoto);
      setIncomingCenterPhoto(null);
      setIsIncomingCenterPhotoReady(false);
    }, CENTER_PHOTO_TRANSITION_MS);

    return () => window.clearTimeout(swap);
  }, [incomingCenterPhoto, isIncomingCenterPhotoReady]);

  if (!visiblePhotos.length || !centerPhoto || !displayedCenterPhoto) {
    return <LiveEmptyState guestUrl={guestUrl} title={event.title} />;
  }

  return (
    <div className="relative isolate h-screen overflow-hidden bg-night text-white">
      <svg
        aria-hidden="true"
        className="live-ambient-glow pointer-events-none absolute z-0"
        viewBox="0 0 620 460"
        preserveAspectRatio="none"
      >
        <filter id="live-ambient-blur" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="58" />
        </filter>
        <g filter="url(#live-ambient-blur)">
          <ellipse cx="300" cy="224" rx="210" ry="142" fill="#D6B36A" opacity="0.16" />
          <ellipse cx="390" cy="282" rx="172" ry="84" fill="#D6B36A" opacity="0.06" />
        </g>
      </svg>

      <SideColumn items={leftColumnItems} direction="down" position="left" />
      <SideColumn items={rightColumnItems} direction="up" position="right" />

      <header className="relative z-20 px-5 pb-1 pt-7 text-center sm:px-8 lg:px-12">
        <h1 className="live-title mx-auto py-2 font-display text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.12] text-white">
          {event.title}
        </h1>
      </header>

      <main className="relative z-10 h-[calc(100vh-5.8rem)] overflow-hidden px-4 pb-16 sm:px-8 lg:px-12">
        <section className="relative z-10 grid h-full place-items-center">
          <div className="live-main-glow relative isolate">
            <figure className="live-photo-card live-main-photo-card relative z-10 aspect-[4/5] w-[min(74vw,28rem)] max-h-[calc(100vh-13rem)] overflow-hidden rounded-lg sm:h-[min(66vh,46rem)] sm:w-auto">
              <Image
                key={displayedCenterPhoto.id}
                src={displayedCenterPhoto.public_url}
                alt="Фото мероприятия"
                fill
                priority
                className="live-center-photo-image object-cover"
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 36vw"
              />
              {incomingCenterPhoto ? (
                <Image
                  key={incomingCenterPhoto.id}
                  src={incomingCenterPhoto.public_url}
                  alt="Фото мероприятия"
                  fill
                  className={`live-center-photo-image object-cover opacity-0 ${
                    isIncomingCenterPhotoReady ? "animate-live-main-photo" : ""
                  }`}
                  sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 36vw"
                  onLoad={() => setIsIncomingCenterPhotoReady(true)}
                  onError={() => {
                    setIncomingCenterPhoto(null);
                    setIsIncomingCenterPhotoReady(false);
                  }}
                />
              ) : null}
            </figure>
          </div>
        </section>

      </main>

      <div className="live-qr-glass pointer-events-auto absolute bottom-5 right-4 z-50 hidden shrink-0 isolate items-center gap-[1.15rem] p-3.5 md:flex lg:bottom-7 lg:right-12">
        <div className="rounded-md bg-white p-[0.58rem]">
          <QRCodeCanvas value={guestUrl} size={106} marginSize={1} />
        </div>
        <div className="pr-2">
          <p className="text-xl font-semibold">Сканируйте QR</p>
          <p className="mt-1 text-[0.95rem] text-white/60">Фото появятся здесь</p>
        </div>
      </div>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end bg-gradient-to-t from-night via-night/80 to-transparent px-5 pb-7 pt-24 sm:px-8 lg:px-12">
        <p className="text-lg font-medium text-white/80">{visiblePhotos.length} фото загружено</p>
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
  const [displayItems, setDisplayItems] = useState(items);
  const [pendingItems, setPendingItems] = useState<SideItem[] | null>(null);
  const itemsSignature = useMemo(() => createSideItemsSignature(items), [items]);
  const displayItemsSignature = useMemo(
    () => createSideItemsSignature(displayItems),
    [displayItems],
  );
  const animationClass =
    direction === "down" ? "animate-live-column-down" : "animate-live-column-up";
  const positionClass =
    position === "left"
      ? "left-3 sm:left-6 lg:left-10"
      : "right-3 sm:right-6 lg:right-10";

  useEffect(() => {
    if (itemsSignature === displayItemsSignature) return;
    setPendingItems(items);
  }, [displayItemsSignature, items, itemsSignature]);

  const handleAnimationIteration = () => {
    if (!pendingItems) return;
    setDisplayItems(pendingItems);
    setPendingItems(null);
  };

  return (
    <aside
      aria-hidden="true"
      className={`live-side-column-mask pointer-events-none absolute bottom-8 top-0 z-0 w-[clamp(4.6rem,14vw,14rem)] overflow-hidden bg-transparent ${positionClass}`}
    >
      <div
        className={`flex flex-col bg-transparent will-change-transform ${animationClass}`}
        onAnimationIteration={handleAnimationIteration}
      >
        <SideColumnSequence items={displayItems} cloneIndex={0} />
        <SideColumnSequence items={displayItems} cloneIndex={1} />
      </div>
    </aside>
  );
}

function SideColumnSequence({ items, cloneIndex }: { items: SideItem[]; cloneIndex: number }) {
  return (
    <div className="flex flex-col gap-4 bg-transparent pb-4 sm:gap-5 sm:pb-5">
      {items.map((item, index) => (
        <SideTile key={`${item.id}-${cloneIndex}`} item={item} index={index} />
      ))}
    </div>
  );
}

function SideTile({ item, index }: { item: SideItem; index: number }) {
  const aspectClass = sideAspectClasses[index % sideAspectClasses.length];

  if (item.type === "placeholder") {
    return (
      <div
        data-live-side-item="placeholder"
        className={`relative shrink-0 overflow-hidden rounded-lg border border-white/10 ${aspectClass} ${item.className}`}
      >
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
    );
  }

  return (
    <figure
      data-live-side-item="photo"
      className={`live-photo-card live-side-photo-card relative shrink-0 overflow-hidden rounded-lg bg-transparent ${aspectClass}`}
    >
      <Image
        src={item.publicUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 640px) 18vw, (max-width: 1024px) 16vw, 14vw"
      />
      <PhotoBorder />
    </figure>
  );
}

function PhotoBorder() {
  return (
    <svg
      aria-hidden="true"
      className="live-photo-border pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <rect
        x="0.5"
        y="0.5"
        width="99"
        height="99"
        rx="2.75"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function createSideItems(photos: LiveScreenPhoto[], side: "left" | "right"): SideItem[] {
  const makePlaceholders = () =>
    Array.from({ length: SIDE_SEQUENCE_LENGTH }, (_, index): SideItem => ({
      type: "placeholder",
      id: `placeholder-${side}-${index}`,
      className:
        placeholderStyles[(index + (side === "left" ? 0 : 2)) % placeholderStyles.length],
    }));

  if (!photos.length) {
    return makePlaceholders();
  }

  const sidePhotos = photos.filter((_, index) =>
    side === "left" ? index % 2 === 0 : index % 2 === 1,
  );

  if (photos.length >= SIDE_REAL_ONLY_PHOTO_COUNT) {
    return sidePhotos.map((photo): SideItem => ({
      type: "photo",
      id: `photo-${side}-${photo.id}`,
      publicUrl: photo.public_url,
    }));
  }

  const items = makePlaceholders();
  const photoSlots = side === "left" ? [1, 3, 5, 6] : [2, 4, 5, 6];

  sidePhotos.forEach((photo, index) => {
    const slotIndex = photoSlots[index];
    if (slotIndex === undefined) return;

    items[slotIndex] = {
      type: "photo",
      id: `photo-${side}-${photo.id}`,
      publicUrl: photo.public_url,
    };
  });

  return items;
}

function createSideItemsSignature(items: SideItem[]) {
  return items.map((item) => item.id).join("|");
}
