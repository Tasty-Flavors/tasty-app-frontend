"use client";

import { useEffect, useId, useRef, type ReactNode, type TouchEvent } from "react";
import { CONSULTA_CELULAR } from "@/lib/useMediaQuery";
import { Button, IconButton } from "./Button";

/** No celular, arrastar o topo do painel além disto para baixo o fecha. */
const ARRASTE_PARA_FECHAR = 90;

interface Props {
  aberto: boolean;
  titulo: ReactNode;
  onFechar: () => void;
  rodape?: ReactNode;
  children: ReactNode;
}

export function Drawer({ aberto, titulo, onFechar, rodape, children }: Props) {
  const idTitulo = useId();
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef(onFechar);
  useEffect(() => {
    fechar.current = onFechar;
  });

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    painel.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fechar.current();
        return;
      }
      if (e.key !== "Tab" || !painel.current) return;
      const focaveis = painel.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)");
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === painel.current)) {
        e.preventDefault();
        ultimo?.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro?.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      anterior?.focus();
    };
  }, [aberto]);

  const inicioArraste = useRef<number | null>(null);
  const distanciaArraste = useRef(0);

  function aoIniciarArraste(e: TouchEvent) {
    if (!window.matchMedia(CONSULTA_CELULAR).matches || (e.target as HTMLElement).closest("button")) return;
    inicioArraste.current = e.touches[0]!.clientY;
    distanciaArraste.current = 0;
  }

  function aoArrastar(e: TouchEvent) {
    if (inicioArraste.current === null || !painel.current) return;
    distanciaArraste.current = Math.max(0, e.touches[0]!.clientY - inicioArraste.current);
    painel.current.style.transform = `translateY(${distanciaArraste.current}px)`;
  }

  function aoSoltarArraste() {
    if (inicioArraste.current === null) return;
    inicioArraste.current = null;
    if (distanciaArraste.current > ARRASTE_PARA_FECHAR) fechar.current();
    else if (painel.current) painel.current.style.transform = "";
  }

  if (!aberto) return null;
  return (
    <>
      <div className="overlay" onClick={onFechar} />
      <div ref={painel} className="drawer" role="dialog" aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1}>
        <header className="drawer__header" onTouchStart={aoIniciarArraste} onTouchMove={aoArrastar} onTouchEnd={aoSoltarArraste} onTouchCancel={aoSoltarArraste}>
          <h2 id={idTitulo} className="card__title">
            {titulo}
          </h2>
          <IconButton icone="fechar" rotulo="Fechar" onClick={onFechar} />
        </header>
        <div className="drawer__body">{children}</div>
        {rodape && <footer className="drawer__footer">{rodape}</footer>}
      </div>
    </>
  );
}

/** Confirmação de ação sensível, no mesmo formato de painel lateral. */
export function Confirmacao({
  aberto, titulo, children, rotuloConfirmar, perigo, ocupado, confirmarDesabilitado, onConfirmar, onCancelar,
}: {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  rotuloConfirmar: string;
  perigo?: boolean;
  ocupado?: boolean;
  confirmarDesabilitado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Drawer
      aberto={aberto}
      titulo={titulo}
      onFechar={onCancelar}
      rodape={
        <>
          <Button onClick={onCancelar}>Cancelar</Button>
          <Button variante={perigo ? "perigo" : "primario"} disabled={ocupado || confirmarDesabilitado} onClick={onConfirmar}>
            {rotuloConfirmar}
          </Button>
        </>
      }
    >
      {children}
    </Drawer>
  );
}
