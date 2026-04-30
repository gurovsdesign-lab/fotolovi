import type { ReactNode } from "react";
import { Card } from "./Card";

export function Modal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mx-auto w-full max-w-xl">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
