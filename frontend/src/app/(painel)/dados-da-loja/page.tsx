import type { Metadata } from "next";
import { DadosLojaView } from "@/views/DadosLojaView";

export const metadata: Metadata = { title: "Dados da Loja" };

export default function Page() {
  return <DadosLojaView />;
}
