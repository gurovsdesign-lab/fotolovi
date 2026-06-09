import Link from "next/link";
import { getMarketingHref } from "@/lib/marketing/routes";
import { marketingSurface } from "@/lib/marketing/typography";

const navigationItems = [
  { href: "/wedding/", label: "Свадьбы" },
  { href: "/photo/", label: "Фото" },
  { href: "/qr/", label: "QR" },
  { href: "/screen/", label: "Экран" },
  { href: "/no-app/", label: "Без приложения" },
];

export function MarketingNavigation() {
  return (
    <nav aria-label="Marketing navigation" className="flex flex-wrap items-center gap-1">
      {navigationItems.map((item) => (
        <Link key={item.href} href={getMarketingHref(item.href)} className={marketingSurface.link}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
