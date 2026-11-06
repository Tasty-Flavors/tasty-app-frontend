import type { Metadata, Viewport } from "next";
import { CadastroView } from "@/views/CadastroView";

export const metadata: Metadata = { title: "Cadastro" };
export const viewport: Viewport = { themeColor: "#ffa60c" };

export default function CadastroPage() {
  return <CadastroView />;
}
