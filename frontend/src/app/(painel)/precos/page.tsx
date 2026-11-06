import type { Metadata } from "next";
import { PrecosView } from "@/views/PrecosView";

export const metadata: Metadata = { title: "Preços" };

export default function Page() {
  return <PrecosView />;
}
