import type { Metadata } from "next";
import { AnunciosView } from "@/views/AnunciosView";

export const metadata: Metadata = { title: "Anúncios" };

export default function Page() {
  return <AnunciosView />;
}
