"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type NomeIcone } from "@/components/ui/Icon";
import { estaAtivo, tituloDaRota } from "./nav";

export function MobileTopBar({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <button type="button" aria-label="Abrir menu" onClick={onAbrirMenu}>
        <Icon nome="menu" />
      </button>
      <span className="topbar__title">{tituloDaRota(pathname)}</span>
      <Link href="/pedidos" aria-label="Ver pedidos" className="topbar__acao">
        <Icon nome="sino" />
      </Link>
    </header>
  );
}

const ABAS: { href: string; rotulo: string; icone: NomeIcone }[] = [
  { href: "/inicio", rotulo: "Início", icone: "inicio" },
  { href: "/pedidos", rotulo: "Pedidos", icone: "pedidos" },
  { href: "/entregadores", rotulo: "Entregas", icone: "moto" },
  { href: "/estoque", rotulo: "Estoque", icone: "caixa" },
];

export function MobileTabBar({ menuAberto, onAbrirMenu }: { menuAberto: boolean; onAbrirMenu: () => void }) {
  const pathname = usePathname();
  const emAba = ABAS.some((a) => estaAtivo(pathname, a.href));
  return (
    <nav className="tabbar" aria-label="Navegação rápida">
      {ABAS.map((a) => (
        <Link key={a.href} href={a.href} className="tabbar__item" aria-current={estaAtivo(pathname, a.href) ? "page" : undefined}>
          <span className="tabbar__pill">
            <Icon nome={a.icone} />
          </span>
          {a.rotulo}
        </Link>
      ))}
      <button type="button" className="tabbar__item" aria-current={menuAberto || !emAba ? "page" : undefined} aria-expanded={menuAberto} onClick={onAbrirMenu}>
        <span className="tabbar__pill">
          <Icon nome="grade" />
        </span>
        Mais
      </button>
    </nav>
  );
}
