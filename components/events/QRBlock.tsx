"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, ExternalLink, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function QRBlock({
  guestUrl,
  liveUrl,
  eventTitle,
}: {
  guestUrl: string;
  liveUrl?: string;
  eventTitle: string;
}) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const fullscreenWindowRef = useRef<Window | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  function downloadQrCode() {
    const canvas = qrRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${createSafeFilename(eventTitle)}-qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openLiveAsTab() {
    if (!liveUrl) return;
    fullscreenWindowRef.current?.blur();
    const liveTab = window.open(liveUrl, "_blank");
    if (liveTab) {
      liveTab.opener = null;
      liveTab.focus();
    }
    setIsLiveModalOpen(false);
  }

  function openLiveFullscreen() {
    if (!liveUrl) return;
    fullscreenWindowRef.current = window.open(
      liveUrl,
      "fotolovi-live-fullscreen",
      "popup=yes,fullscreen=yes,width=1440,height=900,menubar=no,toolbar=no,location=no,status=no",
    );
    if (fullscreenWindowRef.current) {
      fullscreenWindowRef.current.opener = null;
      fullscreenWindowRef.current.focus();
    }
    setIsLiveModalOpen(false);
  }

  return (
    <>
      <Card className="relative grid gap-5">
        <button
          type="button"
          className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-xl border border-black/10 bg-white text-muted shadow-sm transition hover:border-action/30 hover:text-action"
          onClick={downloadQrCode}
          aria-label="Скачать QR-код"
          title="Скачать QR-код"
        >
          <Download className="size-4" />
        </button>
        <div className="pr-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">QR для гостей</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Ссылка на загрузку фото</h2>
        </div>
        <div className="w-fit rounded-2xl bg-white p-3 ring-1 ring-black/5">
          <QRCodeCanvas ref={qrRef} value={guestUrl} size={180} marginSize={2} bgColor="transparent" />
        </div>
        <div className="break-all rounded-xl bg-ivory p-3 text-sm text-muted">{guestUrl}</div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(guestUrl)}>
            <Copy className="size-4" />
            Скопировать
          </Button>
          {liveUrl ? (
            <Button type="button" variant="dark" onClick={() => setIsLiveModalOpen(true)}>
              <ExternalLink className="size-4" />
              Открыть live screen
            </Button>
          ) : null}
        </div>
      </Card>

      {isLiveModalOpen && liveUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="open-live-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="open-live-title" className="text-xl font-semibold text-ink">
                  Открыть Live Screen
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Для полноэкранного показа откроем отдельное чистое окно. Если браузер не включит fullscreen сам, нажмите F11 или системную кнопку полноэкранного режима.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted transition hover:bg-black/5 hover:text-ink"
                onClick={() => setIsLiveModalOpen(false)}
                aria-label="Закрыть выбор live screen"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="dark" className="h-auto min-h-14 px-4" onClick={openLiveFullscreen}>
                <Maximize2 className="size-4" />
                <span className="text-left">Открыть в полноэкранном режиме</span>
              </Button>
              <Button type="button" variant="secondary" className="h-auto min-h-14 px-4" onClick={openLiveAsTab}>
                <ExternalLink className="size-4" />
                <span className="text-left">Открыть как вкладку браузера</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function createSafeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";
}
