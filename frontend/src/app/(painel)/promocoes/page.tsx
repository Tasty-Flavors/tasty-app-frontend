import type { Metadata } from "next";
import { PromocoesView } from "@/views/PromocoesView";

export const metadata: Metadata = { title: "Promoções" };

export default function Page() {
  return <PromocoesView />;
}
