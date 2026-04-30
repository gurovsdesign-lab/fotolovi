"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function QRBlock({ guestUrl, screenUrl }: { guestUrl: string; screenUrl?: string }) {
  return (
    <Card className="grid gap-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">QR для гостей</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Ссылка на загрузку фото</h2>
      </div>
      <div className="w-fit rounded-2xl bg-white p-3 ring-1 ring-black/5">
        <QRCodeCanvas value={guestUrl} size={180} marginSize={2} />
      </div>
      <div className="break-all rounded-xl bg-ivory p-3 text-sm text-muted">{guestUrl}</div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(guestUrl)}>
          <Copy className="size-4" />
          Скопировать
        </Button>
        {screenUrl ? (
          <a href={screenUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="dark">
              <ExternalLink className="size-4" />
              Открыть live screen
            </Button>
          </a>
        ) : null}
      </div>
    </Card>
  );
}
