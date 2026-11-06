import type { Metadata } from "next";
import { PrivacidadeView } from "@/views/PrivacidadeView";

export const metadata: Metadata = { title: "Privacidade e Segurança" };

export default function Page() {
  return <PrivacidadeView />;
}
