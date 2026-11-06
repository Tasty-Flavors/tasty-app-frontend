"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { getToken } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import { desbloquearAudio } from "@/lib/som";
import { usePreferencias } from "@/lib/usePreferencias";
import { aplicarPreferencias, lerPreferencias, obterRestaurante } from "@/services/loja";
import { MobileTabBar, MobileTopBar } from "./MobileBars";
import { tituloDaRota } from "./nav";
import { Sidebar } from "./Sidebar";
import { useAlertasPainel } from "./useAlertasPainel";
import { useNarrador } from "./useNarrador";

const CHAVE_RECOLHIDO = "tasty:menu-recolhido";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Com mocks não há sessão a validar; sem mocks, só libera depois de achar o token.
  const [autorizado, setAutorizado] = useState(USE_MOCKS);
  const [recolhido, setRecolhido] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeLoja, setNomeLoja] = useState<string>();
  const { prefs } = usePreferencias();
  const { pedidosNovos, alertasEstoque } = useAlertasPainel(pathname, autorizado);

  useNarrador(prefs.narrador, tituloDaRota(pathname));

  useEffect(() => {
    if (USE_MOCKS || getToken()) setAutorizado(true);
    else router.replace("/login");
  }, [router]);

  useEffect(() => {
    aplicarPreferencias(lerPreferencias());
    try {
      setRecolhido(window.localStorage.getItem(CHAVE_RECOLHIDO) === "true");
    } catch {
      /* sem armazenamento: começa expandido */
    }
    window.addEventListener("pointerdown", desbloquearAudio, { once: true });
    return () => window.removeEventListener("pointerdown", desbloquearAudio);
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    obterRestaurante()
      .then((r) => setNomeLoja(r.nomeEstabelecimento))
      .catch(() => undefined);
  }, [autorizado]);

  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  function alternarRecolhido() {
    const novo = !recolhido;
    setRecolhido(novo);
    try {
      window.localStorage.setItem(CHAVE_RECOLHIDO, String(novo));
    } catch {
      /* vale só nesta sessão */
    }
  }

  if (!autorizado) return null;

  return (
    <>
      <MobileTopBar onAbrirMenu={() => setMenuAberto(true)} />
      <div className={recolhido ? "shell shell--recolhido" : "shell"}>
        <Sidebar aberto={menuAberto} nomeLoja={nomeLoja} selos={{ "/pedidos": pedidosNovos, "/estoque": alertasEstoque }} onNavegar={() => setMenuAberto(false)} />
        {menuAberto && <div className="overlay overlay--menu" onClick={() => setMenuAberto(false)} />}
        <main className="main">
          <button type="button" className="collapse-btn" aria-label={recolhido ? "Expandir menu" : "Recolher menu"} aria-expanded={!recolhido} onClick={alternarRecolhido}>
            <Icon nome={recolhido ? "seta-direita" : "seta-esquerda"} />
          </button>
          <div className="main__inner">{children}</div>
        </main>
      </div>
      <MobileTabBar menuAberto={menuAberto} onAbrirMenu={() => setMenuAberto((a) => !a)} />
    </>
  );
}
