import type { Metadata } from "next";
import { ClientesView } from "@/views/ClientesView";

export const metadata: Metadata = { title: "Seus Clientes" };

export default function Page() {
  return <ClientesView />;
}
