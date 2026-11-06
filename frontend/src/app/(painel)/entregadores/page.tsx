import type { Metadata } from "next";
import { EntregadoresView } from "@/views/EntregadoresView";

export const metadata: Metadata = { title: "Entregadores" };

export default function Page() {
  return <EntregadoresView />;
}
