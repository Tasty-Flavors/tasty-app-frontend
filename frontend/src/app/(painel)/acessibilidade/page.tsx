import type { Metadata } from "next";
import { AcessibilidadeView } from "@/views/AcessibilidadeView";

export const metadata: Metadata = { title: "Acessibilidade" };

export default function Page() {
  return <AcessibilidadeView />;
}
