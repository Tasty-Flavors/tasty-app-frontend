"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { getToken } from "@/lib/auth";
import { USE_AUTH_MOCKS } from "@/lib/config";
import { desbloquearAudio } from "@/lib/som";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePreferencias } from "@/lib/usePreferencias";
import { aplicarPreferencias, lerPreferencias, obterRestaurante } from "@/services/loja";
import { MobileTabBar, MobileTopBar } from "./MobileBars";
import { tituloDaRota } from "./nav";
import { Sidebar } from "./Sidebar";
import { useAlertasPainel } from "./useAlertasPainel";
import { useNarrador } from "./useNarrador";

const CHAVE_RECOLHIDO = "tasty:menu-recolhido";
/** Até aqui o menu começa só com ícones, para sobrar espaço às tabelas e ao quadro. */
const TELA_ESTREITA = "(max-width: 1279px)";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Com login fictício não há sessão a validar; com o real, só libera depois de achar o token.
  const [autorizado, setAutorizado] = useState(USE_AUTH_MOCKS);
  // null = sem escolha da pessoa: o menu segue o tamanho da tela.
  const [escolhaRecolhido, setEscolhaRecolhido] = useState<boolean | null>(null);
  const telaEstreita = useMediaQuery(TELA_ESTREITA);
  const recolhido = escolhaRecolhido ?? telaEstreita;
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeLoja, setNomeLoja] = useState<string>();
  const { prefs } = usePreferencias();
  const { pedidosNovos, alertasEstoque } = useAlertasPainel(pathname, autorizado);

  useNarrador(prefs.narrador, tituloDaRota(pathname));

  useEffect(() => {
    if (USE_AUTH_MOCKS || getToken()) setAutorizado(true);
    else router.replace("/login");
  }, [router]);

  useEffect(() => {
    aplicarPreferencias(lerPreferencias());
    try {
      const salvo = window.localStorage.getItem(CHAVE_RECOLHIDO);
      if (salvo !== null) setEscolhaRecolhido(salvo === "true");
    } catch {
      /* sem armazenamento: segue o tamanho da tela */
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
    setEscolhaRecolhido(novo);
    try {
      window.localStorage.setItem(CHAVE_RECOLHIDO, String(novo));
    } catch {
      /* vale só nesta sessão */
    }
  }

  if (!autorizado) return null;

  const selos = { "/pedidos": pedidosNovos, "/estoque": alertasEstoque };

  return (
    <>
      <MobileTopBar pedidosNovos={pedidosNovos} onAbrirMenu={() => setMenuAberto(true)} />
      <div className={recolhido ? "shell shell--recolhido" : "shell"}>
        <Sidebar aberto={menuAberto} nomeLoja={nomeLoja} selos={selos} onNavegar={() => setMenuAberto(false)} />
        {menuAberto && <div className="overlay overlay--menu" onClick={() => setMenuAberto(false)} />}
        <main className="main">
          <button type="button" className="collapse-btn" aria-label={recolhido ? "Expandir menu" : "Recolher menu"} aria-expanded={!recolhido} onClick={alternarRecolhido}>
            <Icon nome={recolhido ? "seta-direita" : "seta-esquerda"} />
          </button>
          <div className="main__inner" key={pathname}>{children}</div>
        </main>
      </div>
      <MobileTabBar menuAberto={menuAberto} selos={selos} onAbrirMenu={() => setMenuAberto((a) => !a)} />
    </>
  );
}
