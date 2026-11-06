import type { Metadata } from "next";
import { ParceriasView } from "@/views/ParceriasView";

export const metadata: Metadata = { title: "Parcerias" };

export default function Page() {
  return <ParceriasView />;
}
