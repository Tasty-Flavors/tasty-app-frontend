import type { Metadata } from "next";
import { InicioView } from "@/views/InicioView";

export const metadata: Metadata = { title: "Início" };

export default function Page() {
  return <InicioView />;
}
