"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type NomeIcone } from "@/components/ui/Icon";
import { estaAtivo, tituloDaRota } from "./nav";

/** As abas mudam com o tamanho da tela pelo CSS, para não piscar ao carregar a página. */
const ABAS: { href: string; rotulo: string; icone: NomeIcone; so?: "celular" | "tablet" }[] = [
  { href: "/inicio", rotulo: "Início", icone: "inicio" },
  { href: "/desempenho", rotulo: "Desempenho", icone: "grafico", so: "celular" },
  { href: "/pedidos", rotulo: "Pedidos", icone: "pedidos" },
  { href: "/entregadores", rotulo: "Entregas", icone: "moto", so: "tablet" },
  { href: "/estoque", rotulo: "Estoque", icone: "caixa", so: "tablet" },
  { href: "/financeiro", rotulo: "Financeiro", icone: "cifrao", so: "celular" },
  { href: "/avaliacoes", rotulo: "Avaliações", icone: "estrela", so: "celular" },
];

const ABAS_TABLET = ABAS.filter((a) => a.so !== "celular");

const descreverAlertas = (n: number) => (n === 1 ? "1 alerta" : `${n} alertas`);

export function MobileTopBar({ pedidosNovos, onAbrirMenu }: { pedidosNovos: number; onAbrirMenu: () => void }) {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <button type="button" className="topbar__menu" aria-label="Abrir menu" onClick={onAbrirMenu}>
        <Icon nome="menu" />
      </button>
      <span className="topbar__title">{tituloDaRota(pathname)}</span>
      <Image src="/assets/png/tasty-logo.png" alt="Tasty Flavors" width={52} height={52} className="topbar__logo" priority />
      <Link href="/pedidos" aria-label={pedidosNovos > 0 ? `Ver pedidos, ${pedidosNovos} novos` : "Ver pedidos"} className="topbar__acao">
        <Icon nome="sino" />
        {pedidosNovos > 0 && <span className="selo">{pedidosNovos}</span>}
      </Link>
    </header>
  );
}

export function MobileTabBar({ menuAberto, selos, onAbrirMenu }: { menuAberto: boolean; selos: Record<string, number>; onAbrirMenu: () => void }) {
  const pathname = usePathname();
  const emAba = ABAS_TABLET.some((a) => estaAtivo(pathname, a.href));
  return (
    <nav className="tabbar" aria-label="Navegação rápida">
      {ABAS.map((a) => {
        const selo = selos[a.href] ?? 0;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={a.so ? `tabbar__item tabbar__item--${a.so}` : "tabbar__item"}
            aria-current={estaAtivo(pathname, a.href) ? "page" : undefined}
            aria-label={selo > 0 ? `${a.rotulo}, ${descreverAlertas(selo)}` : undefined}
          >
            <span className="tabbar__pill">
              <Icon nome={a.icone} />
              {selo > 0 && <span className="selo">{selo}</span>}
            </span>
            {a.rotulo}
          </Link>
        );
      })}
      <button type="button" className="tabbar__item tabbar__item--tablet" aria-current={menuAberto || !emAba ? "page" : undefined} aria-expanded={menuAberto} onClick={onAbrirMenu}>
        <span className="tabbar__pill">
          <Icon nome="grade" />
        </span>
        Mais
      </button>
    </nav>
  );
}
