import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
};

export function Input({ className, label, hint, id, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-ink" htmlFor={id}>
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        id={id}
        className={cn(
          "h-12 rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-muted/70 focus:border-action focus:ring-4 focus:ring-action/10",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
