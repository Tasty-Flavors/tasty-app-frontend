import type { Metadata } from "next";
import { EstoqueView } from "@/views/EstoqueView";

export const metadata: Metadata = { title: "Estoque" };

export default function Page() {
  return <EstoqueView />;
}
