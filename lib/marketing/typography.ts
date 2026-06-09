export const marketingTypography = {
  eyebrow: "text-xs font-semibold uppercase tracking-[0.2em] text-ml-accent",
  h1: "text-4xl font-semibold leading-tight text-ml-ink sm:text-5xl",
  h2: "text-2xl font-semibold leading-tight text-ml-ink",
  body: "text-base leading-7 text-ml-muted",
  small: "text-sm leading-6 text-ml-muted",
} as const;

export const marketingSurface = {
  page: "bg-ml-bg text-ml-ink",
  band: "border-y border-ml-line bg-white",
  panel: "rounded-lg border border-ml-line bg-white p-5",
  link:
    "rounded-md px-3 py-2 text-sm font-medium text-ml-muted transition hover:bg-ml-soft hover:text-ml-ink focus:outline-none focus:ring-2 focus:ring-ml-focus",
  primaryLink:
    "inline-flex h-11 items-center justify-center rounded-md bg-ml-ink px-4 text-sm font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-ml-focus",
} as const;
