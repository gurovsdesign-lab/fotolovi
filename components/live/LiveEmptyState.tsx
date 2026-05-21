"use client";

import { QRCodeCanvas } from "qrcode.react";

export function LiveEmptyState({
  guestUrl,
  title,
  accessCode,
}: {
  guestUrl: string;
  title: string;
  accessCode?: string | null;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-night px-6 text-white">
      <div className="live-empty-glow absolute inset-0" />
      <div className="relative grid justify-items-center gap-8 text-center">
        <p className="font-display text-5xl text-white sm:text-7xl">{title}</p>
        <div className="rounded-[2rem] bg-white p-5 shadow-glow">
          <QRCodeCanvas value={guestUrl} size={260} marginSize={2} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Сканируйте QR и добавляйте фото</h1>
          {accessCode ? (
            <p className="mt-3 text-2xl font-semibold tracking-[0.18em] text-gold">{accessCode}</p>
          ) : null}
          <p className="mt-3 text-lg text-white/68">Ваши фотографии появятся на экране</p>
        </div>
      </div>
    </div>
  );
}
