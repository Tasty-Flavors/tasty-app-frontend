"use client";

import { useLayoutEffect, useRef, useState } from "react";

const LARGURA_MINIMA = 240;
const ALTURA_MINIMA = 200;
const ALTURA_MAXIMA = 320;
/** Largura reservada por rótulo do eixo X, para não colidirem. */
const LARGURA_ROTULO = 44;

/**
 * Desenha o gráfico na largura real do contêiner: com um viewBox fixo, o SVG inteiro
 * encolhe no celular e o texto dos eixos fica ilegível.
 */
export function useDimensoesGrafico() {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(720);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setLargura(Math.max(LARGURA_MINIMA, Math.round(el.clientWidth)));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return {
    ref,
    L: largura,
    A: Math.min(ALTURA_MAXIMA, Math.max(ALTURA_MINIMA, Math.round(largura * 0.39))),
    rotulosVisiveis: Math.max(3, Math.floor(largura / LARGURA_ROTULO)),
  };
}
