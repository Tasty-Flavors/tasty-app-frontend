import type { Metadata } from "next";
import { PremiumView } from "@/views/PremiumView";

export const metadata: Metadata = { title: "Premium" };

export default function Page() {
  return <PremiumView />;
}
