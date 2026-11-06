import type { Metadata, Viewport } from "next";
import { Average, Averia_Serif_Libre, Raleway, Roboto } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/components.css";
import "@/styles/layout.css";
import "@/styles/views.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-roboto", display: "swap" });
const average = Average({ subsets: ["latin"], weight: "400", variable: "--font-average", display: "swap" });
const averia = Averia_Serif_Libre({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-averia", display: "swap" });
const raleway = Raleway({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-raleway", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Tasty — Painel do restaurante", template: "%s · Tasty" },
  description: "Painel do restaurante Tasty Flavors: pedidos, entregadores, estoque, preços e marketing.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/* Aplica o tema salvo antes da primeira pintura, para o modo escuro não piscar em branco. */
const aplicarTemaSalvo = `try{var p=JSON.parse(localStorage.getItem("tasty:acessibilidade")||"{}"),r=document.documentElement;r.dataset.theme=p.modoEscuro?"dark":"light";r.dataset.vision=p.daltonismo?"cvd":"default";r.dataset.motion=p.animacoes===false?"reduced":"full"}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} ${average.variable} ${averia.variable} ${raleway.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: aplicarTemaSalvo }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
