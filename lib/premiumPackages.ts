export type PremiumPackageId = "events_1" | "events_3" | "events_5" | "events_10";

export type PremiumPackage = {
  id: PremiumPackageId;
  events: number;
  title: string;
  totalPrice: number;
  priceLabel: string;
  pricePerEvent: number;
  isPopular?: boolean;
};

export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: "events_1",
    events: 1,
    title: "1 мероприятие",
    totalPrice: 990,
    priceLabel: "≈ 990 ₽",
    pricePerEvent: 990,
  },
  {
    id: "events_3",
    events: 3,
    title: "3 мероприятия",
    totalPrice: 2490,
    priceLabel: "≈ 2 490 ₽",
    pricePerEvent: 830,
  },
  {
    id: "events_5",
    events: 5,
    title: "5 мероприятий",
    totalPrice: 3990,
    priceLabel: "≈ 3 990 ₽",
    pricePerEvent: 798,
    isPopular: true,
  },
  {
    id: "events_10",
    events: 10,
    title: "10 мероприятий",
    totalPrice: 4990,
    priceLabel: "≈ 4 990 ₽",
    pricePerEvent: 499,
  },
];

export function getPremiumPackage(packageId: string | null | undefined) {
  return (
    PREMIUM_PACKAGES.find((premiumPackage) => premiumPackage.id === packageId) ?? null
  );
}

export function formatPremiumPackageForAdmin(
  packageEvents: number,
  totalPrice: number | null | undefined,
) {
  const packageLabel = `${packageEvents} ${getEventWord(packageEvents)}`;
  if (!totalPrice) return packageLabel;

  return `${packageLabel} · ${new Intl.NumberFormat("ru-RU").format(totalPrice)} ₽`;
}

function getEventWord(count: number) {
  if (count === 1) return "мероприятие";
  if (count > 1 && count < 5) return "мероприятия";
  return "мероприятий";
}
