"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { logout } from "@/lib/auth";
import { estaAtivo, MENU, type ItemMenu } from "./nav";

function IconeItem({ item }: { item: ItemMenu }) {
  if (item.svg) return <Icon nome={item.svg} className="sidebar__icon" />;
  return <Image src={item.png!} alt="" width={24} height={24} className="sidebar__icon" loading="eager" unoptimized />;
}

interface Props {
  aberto: boolean;
  nomeLoja?: string;
  /** Contadores por rota, exibidos como selo no item. */
  selos: Record<string, number>;
  onNavegar: () => void;
}

export function Sidebar({ aberto, nomeLoja, selos, onNavegar }: Props) {
  const pathname = usePathname();
  return (
    <nav className={aberto ? "sidebar sidebar--aberto" : "sidebar"} aria-label="Menu principal">
      <div className="sidebar__brand">
        <Image src="/assets/png/tasty-logo.png" alt="Tasty Flavors Delivery" width={114} height={75} priority />
        {nomeLoja && <span>{nomeLoja}</span>}
      </div>
      {MENU.map((grupo) => (
        <div key={grupo.titulo ?? "raiz"}>
          {grupo.titulo && <div className="sidebar__group">{grupo.titulo}</div>}
          <ul className="sidebar__list">
            {grupo.itens.map((item) => {
              const selo = selos[item.href] ?? 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="sidebar__item"
                    aria-current={estaAtivo(pathname, item.href) ? "page" : undefined}
                    aria-label={selo > 0 ? `${item.rotulo}, ${selo} ${selo === 1 ? "alerta" : "alertas"}` : item.rotulo}
                    title={item.rotulo}
                    onClick={onNavegar}
                  >
                    <IconeItem item={item} />
                    <span className="sidebar__label">{item.rotulo}</span>
                    {selo > 0 && <span className="sidebar__badge">{selo}</span>}
                  </Link>
                </li>
              );
            })}
            {grupo.titulo === "Configurações da Loja" && (
              <li>
                <button type="button" className="sidebar__item" aria-label="Logout" title="Logout" onClick={logout}>
                  <Image src="/assets/icons/sair.png" alt="" width={24} height={24} className="sidebar__icon" loading="eager" unoptimized />
                  <span className="sidebar__label">Logout</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}
