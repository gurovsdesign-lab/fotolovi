"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { LIVE_REFRESH_MS } from "@/lib/constants";
import type { LiveScreenEvent, LiveScreenPhoto } from "@/types/live";
import { LiveEmptyState } from "./LiveEmptyState";

const CENTER_PHOTO_INTERVAL_MS = 4500;
const CENTER_PHOTO_TRANSITION_MS = 900;
const SNAKE_MIN_QUEUE_LENGTH = 16;
const SNAKE_STEP_MS = 5200;
const SNAKE_OFFSCREEN_INSERT_INDEX = 8;

type SideItem =
  | {
      type: "photo";
      id: string;
      photoId: string;
      publicUrl: string;
      aspectClass: string;
    }
  | {
      type: "placeholder";
      id: string;
      className: string;
      aspectClass: string;
    };

type SnakeState = {
  queue: SideItem[];
  pendingQueue: SideItem[] | null;
};

type SnakeAction =
  | {
      type: "sync";
      photos: LiveScreenPhoto[];
    }
  | {
      type: "commitPending";
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
  showPhotos = true,
  explanatoryText,
}: {
  event: LiveScreenEvent;
  initialPhotos: LiveScreenPhoto[];
  guestUrl: string;
  showPhotos?: boolean;
  explanatoryText?: string | null;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [centerPhotoIndex, setCenterPhotoIndex] = useState(0);
  const [displayedCenterPhoto, setDisplayedCenterPhoto] = useState<LiveScreenPhoto | null>(
    initialPhotos[0] ?? null,
  );
  const [incomingCenterPhoto, setIncomingCenterPhoto] = useState<LiveScreenPhoto | null>(null);
  const [isIncomingCenterPhotoReady, setIsIncomingCenterPhotoReady] = useState(false);

  useEffect(() => {
    if (!showPhotos) return;

    const fetchPhotos = async () => {
      const response = await fetch(`/api/events/${event.slug}/photos?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = (await response.json()) as { photos: LiveScreenPhoto[] };
      setPhotos(payload.photos);
    };

    void fetchPhotos();
    const refresh = window.setInterval(fetchPhotos, LIVE_REFRESH_MS);
    return () => window.clearInterval(refresh);
  }, [event.slug, showPhotos]);

  const visiblePhotos = useMemo(() => (showPhotos ? photos : []), [photos, showPhotos]);
  const centerPhoto = visiblePhotos.length
    ? visiblePhotos[centerPhotoIndex % visiblePhotos.length]
    : null;
  const visiblePhotoIds = useMemo(
    () => new Set(visiblePhotos.map((photo) => photo.id)),
    [visiblePhotos],
  );

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
    if (!incomingCenterPhoto || visiblePhotoIds.has(incomingCenterPhoto.id)) return;
    setIncomingCenterPhoto(null);
    setIsIncomingCenterPhotoReady(false);
  }, [incomingCenterPhoto, visiblePhotoIds]);

  useEffect(() => {
    if (!incomingCenterPhoto || !isIncomingCenterPhotoReady) return;

    const swap = window.setTimeout(() => {
      setDisplayedCenterPhoto(incomingCenterPhoto);
      setIncomingCenterPhoto(null);
      setIsIncomingCenterPhotoReady(false);
    }, CENTER_PHOTO_TRANSITION_MS);

    return () => window.clearTimeout(swap);
  }, [incomingCenterPhoto, isIncomingCenterPhotoReady]);

  const guestAccessCode = event.guest_access_code_enabled ? event.guest_access_code : null;

  if (!visiblePhotos.length || !centerPhoto || !displayedCenterPhoto) {
    return (
      <LiveEmptyState
        guestUrl={guestUrl}
        title={event.title}
        accessCode={guestAccessCode}
        explanatoryText={explanatoryText}
      />
    );
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

      <SnakeSideColumns photos={visiblePhotos} />

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
          {guestAccessCode ? (
            <p className="mt-1 text-2xl font-semibold tracking-[0.18em] text-gold">{guestAccessCode}</p>
          ) : null}
          <p className="mt-1 text-[0.95rem] text-white/60">Фото появятся здесь</p>
        </div>
      </div>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end bg-gradient-to-t from-night via-night/80 to-transparent px-5 pb-7 pt-24 sm:px-8 lg:px-12">
        <p className="text-lg font-medium text-white/80">{visiblePhotos.length} фото загружено</p>
      </footer>
    </div>
  );
}

function SnakeSideColumns({ photos }: { photos: LiveScreenPhoto[] }) {
  const latestPhotosRef = useRef(photos);
  const [{ queue, pendingQueue }, dispatchSnakeAction] = useReducer(
    snakeReducer,
    photos,
    createInitialSnakeState,
  );
  const photosSignature = useMemo(() => createPhotosSignature(photos), [photos]);
  const leftColumnItems = useMemo(
    () => createSideColumnCycleItems(queue, "left"),
    [queue],
  );
  const rightColumnItems = useMemo(
    () => createSideColumnCycleItems(queue, "right"),
    [queue],
  );

  useEffect(() => {
    latestPhotosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    dispatchSnakeAction({ type: "sync", photos: latestPhotosRef.current });
  }, [photosSignature]);

  return (
    <>
      <SideColumn
        items={leftColumnItems}
        direction="down"
        position="left"
        onCycle={() => {
          if (!pendingQueue) return;
          dispatchSnakeAction({ type: "commitPending" });
        }}
      />
      <SideColumn items={rightColumnItems} direction="up" position="right" />
    </>
  );
}

function createInitialSnakeState(photos: LiveScreenPhoto[]): SnakeState {
  return {
    queue: reconcileSnakeQueue([], photos),
    pendingQueue: null,
  };
}

function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  if (action.type === "commitPending") {
    if (!state.pendingQueue) return state;

    return {
      queue: state.pendingQueue,
      pendingQueue: null,
    };
  }

  const pendingQueue = reconcileSnakeQueue(state.pendingQueue ?? state.queue, action.photos);
  if (createSnakeQueueSignature(pendingQueue) === createSnakeQueueSignature(state.queue)) {
    return {
      ...state,
      pendingQueue: null,
    };
  }

  return {
    ...state,
    pendingQueue,
  };
}

function SideColumn({
  items,
  direction,
  position,
  onCycle,
}: {
  items: SideItem[];
  direction: "up" | "down";
  position: "left" | "right";
  onCycle?: () => void;
}) {
  const positionClass =
    position === "left"
      ? "left-3 sm:left-6 lg:left-10"
      : "right-3 sm:right-6 lg:right-10";
  const trackStyle = {
    "--live-snake-cycle-duration": `${items.length * SNAKE_STEP_MS}ms`,
  } as CSSProperties;

  return (
    <aside
      aria-hidden="true"
      className={`live-side-column-mask pointer-events-none absolute bottom-8 top-0 z-0 w-[clamp(4.6rem,14vw,14rem)] overflow-hidden bg-transparent ${positionClass}`}
    >
      <div
        className="live-snake-column-track flex flex-col bg-transparent will-change-transform"
        data-direction={direction}
        onAnimationIteration={onCycle}
        style={trackStyle}
      >
        <SideColumnSequence items={items} cloneIndex={0} />
        <SideColumnSequence items={items} cloneIndex={1} />
      </div>
    </aside>
  );
}

function SideColumnSequence({ items, cloneIndex }: { items: SideItem[]; cloneIndex: number }) {
  return (
    <div className="flex flex-col gap-4 bg-transparent pb-4 sm:gap-5 sm:pb-5">
      {items.map((item, index) => (
        <SideTile key={`${cloneIndex}-${index}`} item={item} index={index} />
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

function reconcileSnakeQueue(currentQueue: SideItem[], photos: LiveScreenPhoto[]): SideItem[] {
  const photosById = new Map(photos.map((photo) => [photo.id, photo]));
  const nextQueue: SideItem[] = [];
  const retainedPhotoIds = new Set<string>();

  currentQueue.forEach((item) => {
    if (!isPhotoItem(item)) return;

    const photo = photosById.get(item.photoId);
    if (!photo || retainedPhotoIds.has(photo.id)) return;

    retainedPhotoIds.add(photo.id);
    nextQueue.push({
      ...item,
      publicUrl: photo.public_url,
    });
  });

  const appendedPhotoItems = photos
    .filter((photo) => !retainedPhotoIds.has(photo.id))
    .map((photo, index) => createPhotoSideItem(photo, nextQueue.length + index));

  appendedPhotoItems.forEach((photoItem) => {
    nextQueue.splice(Math.min(SNAKE_OFFSCREEN_INSERT_INDEX, nextQueue.length), 0, photoItem);
  });

  while (nextQueue.length < createTargetSnakeQueueLength(photos.length)) {
    const index = nextQueue.length;
    nextQueue.push(createPlaceholderSideItem(index, index));
  }

  return nextQueue;
}

function createTargetSnakeQueueLength(photoCount: number) {
  return Math.max(photoCount, SNAKE_MIN_QUEUE_LENGTH);
}

function createPhotoSideItem(photo: LiveScreenPhoto, index: number): SideItem {
  return {
    type: "photo",
    id: `photo-${photo.id}`,
    photoId: photo.id,
    publicUrl: photo.public_url,
    aspectClass: sideAspectClasses[index % sideAspectClasses.length],
  };
}

function createPlaceholderSideItem(placeholderIndex: number, visualIndex: number): SideItem {
  return {
    type: "placeholder",
    id: `placeholder-${placeholderIndex}`,
    className: placeholderStyles[visualIndex % placeholderStyles.length],
    aspectClass: sideAspectClasses[visualIndex % sideAspectClasses.length],
  };
}

function createSideColumnCycleItems(
  queue: SideItem[],
  position: "left" | "right",
): SideItem[] {
  if (!queue.length) return [];

  return Array.from({ length: queue.length }, (_, index) =>
    position === "left"
      ? getSnakeQueueItem(queue, -index)
      : getSnakeQueueItem(queue, index - 7),
  );
}

function getSnakeQueueItem(queue: SideItem[], index: number) {
  return queue[normalizeSnakeIndex(index, queue.length)];
}

function normalizeSnakeIndex(index: number, length: number) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function createPhotosSignature(photos: LiveScreenPhoto[]) {
  return photos.map((photo) => `${photo.id}:${photo.public_url}`).join("|");
}

function createSnakeQueueSignature(queue: SideItem[]) {
  return queue.map((item) => item.id).join("|");
}

function isPhotoItem(item: SideItem): item is Extract<SideItem, { type: "photo" }> {
  return item.type === "photo";
}
