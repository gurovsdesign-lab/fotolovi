import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-action text-white shadow-soft hover:bg-[#3859dd]",
  secondary: "border border-black/10 bg-white text-ink hover:border-action/30 hover:text-action",
  ghost: "text-muted hover:bg-black/5 hover:text-ink",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  dark: "bg-ink text-white hover:bg-black",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
