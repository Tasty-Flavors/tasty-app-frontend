import type { Metadata } from "next";
import { DesempenhoView } from "@/views/DesempenhoView";

export const metadata: Metadata = { title: "Desempenho" };

export default function Page() {
  return <DesempenhoView />;
}
