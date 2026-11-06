import type { Metadata } from "next";
import { CardapiosView } from "@/views/CardapiosView";

export const metadata: Metadata = { title: "Cardápios" };

export default function Page() {
  return <CardapiosView />;
}
