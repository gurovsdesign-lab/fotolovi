import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="grid justify-items-start gap-4">
      <div>
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </Card>
  );
}
