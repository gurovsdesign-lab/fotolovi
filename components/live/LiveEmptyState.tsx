"use client";

import { QRCodeCanvas } from "qrcode.react";

export function LiveEmptyState({ guestUrl, title }: { guestUrl: string; title: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-night px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,179,106,0.18),transparent_34rem)]" />
      <div className="relative grid justify-items-center gap-8 text-center">
        <p className="font-display text-5xl text-white sm:text-7xl">{title}</p>
        <div className="rounded-[2rem] bg-white p-5 shadow-glow">
          <QRCodeCanvas value={guestUrl} size={260} marginSize={2} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Сканируйте QR и добавляйте фото</h1>
          <p className="mt-3 text-lg text-white/68">Ваши фотографии появятся на экране</p>
        </div>
      </div>
    </div>
  );
}
