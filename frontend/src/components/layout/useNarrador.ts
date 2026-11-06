"use client";

import { useEffect } from "react";

function falar(texto: string) {
  if (!texto || typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  speechSynthesis.speak(fala);
}

function nomeDoElemento(el: HTMLElement) {
  const rotuloCampo = el.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`)?.innerText : undefined;
  return (el.getAttribute("aria-label") ?? rotuloCampo ?? el.innerText ?? el.getAttribute("placeholder") ?? "").trim().slice(0, 200);
}

/** Narrador do painel: anuncia a tela aberta e o elemento em foco, com a voz do navegador. */
export function useNarrador(ativo: boolean, tituloTela: string) {
  useEffect(() => {
    if (ativo) falar(`Tela ${tituloTela}`);
  }, [ativo, tituloTela]);

  useEffect(() => {
    if (!ativo) return;
    const aoFocar = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement) falar(nomeDoElemento(e.target));
    };
    document.addEventListener("focusin", aoFocar);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    };
  }, [ativo]);
}
