import type { Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

/** A barra de status do celular se funde com a barra superior do painel. */
export const viewport: Viewport = { themeColor: "#ffa60c" };

export default function PainelLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
