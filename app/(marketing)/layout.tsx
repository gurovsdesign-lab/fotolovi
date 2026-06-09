import type { ReactNode } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function MarketingRouteGroupLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
