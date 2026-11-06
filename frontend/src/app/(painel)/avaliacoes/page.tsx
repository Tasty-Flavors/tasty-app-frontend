import type { Metadata } from "next";
import { AvaliacoesView } from "@/views/AvaliacoesView";

export const metadata: Metadata = { title: "Avaliações" };

export default function Page() {
  return <AvaliacoesView />;
}
