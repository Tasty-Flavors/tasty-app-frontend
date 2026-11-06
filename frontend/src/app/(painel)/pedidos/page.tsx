import type { Metadata } from "next";
import { PedidosView } from "@/views/PedidosView";

export const metadata: Metadata = { title: "Pedidos" };

export default function Page() {
  return <PedidosView />;
}
