"use client";

import { useState } from "react";
import type { SerieDiaria } from "@/types";
import { ChartTable, ChartTooltip } from "./ChartTable";
import { marcasEixo, passoRotulos, rotuloEixo } from "./escala";
import { useDimensoesGrafico } from "./useDimensoesGrafico";

const M = { topo: 12, dir: 16, base: 26, esq: 52 };

interface Props {
  titulo: string;
  dados: SerieDiaria[];
  formatar?: (v: number) => string;
}

export function LineChart({ titulo, dados, formatar = (v) => v.toLocaleString("pt-BR") }: Props) {
  const { ref, L, A, rotulosVisiveis } = useDimensoesGrafico();
  const [ativo, setAtivo] = useState<number | null>(null);
  const marcas = marcasEixo(Math.max(0, ...dados.map((d) => d.valor)));
  const topo = marcas[marcas.length - 1]!;
  const larguraPlot = L - M.esq - M.dir;
  const alturaPlot = A - M.topo - M.base;
  const passoX = larguraPlot / Math.max(1, dados.length - 1);
  const x = (i: number) => M.esq + (dados.length > 1 ? passoX * i : larguraPlot / 2);
  const y = (v: number) => M.topo + alturaPlot - (v / topo) * alturaPlot;
  const salto = passoRotulos(dados.length, rotulosVisiveis);
  const pontos = dados.map((d, i) => `${x(i)},${y(d.valor)}`).join(" ");

  /** A linha é fina demais para mirar: o ponteiro encaixa no X mais próximo. */
  function aoMover(e: React.PointerEvent<SVGSVGElement>) {
    const caixa = e.currentTarget.getBoundingClientRect();
    const xSvg = ((e.clientX - caixa.left) / caixa.width) * L;
    setAtivo(Math.min(dados.length - 1, Math.max(0, Math.round((xSvg - M.esq) / passoX))));
  }

  function aoTeclar(e: React.KeyboardEvent<SVGSVGElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    setAtivo((a) => Math.min(dados.length - 1, Math.max(0, (a ?? (delta > 0 ? -1 : dados.length)) + delta)));
  }

  return (
    <div className="chart" ref={ref}>
      <svg
        viewBox={`0 0 ${L} ${A}`}
        role="img"
        aria-label={`${titulo}. Use as setas para percorrer os valores.`}
        tabIndex={0}
        onPointerMove={aoMover}
        onPointerLeave={() => setAtivo(null)}
        onKeyDown={aoTeclar}
        onBlur={() => setAtivo(null)}
      >
        {marcas.map((m) => (
          <g key={m}>
            <line className="chart__grid" x1={M.esq} x2={L - M.dir} y1={y(m)} y2={y(m)} />
            <text className="chart__axis" x={M.esq - 8} y={y(m) + 4} textAnchor="end">
              {rotuloEixo(m)}
            </text>
          </g>
        ))}
        {dados.map(
          (d, i) =>
            i % salto === 0 && (
              <text key={`${d.rotulo}-${i}`} className="chart__axis" x={x(i)} y={A - 8} textAnchor="middle">
                {d.rotulo}
              </text>
            ),
        )}
        <polyline className="chart__line" points={pontos} />
        {ativo !== null && dados[ativo] && (
          <>
            <line className="chart__crosshair" x1={x(ativo)} x2={x(ativo)} y1={M.topo} y2={y(0)} />
            <circle className="chart__point" cx={x(ativo)} cy={y(dados[ativo].valor)} r={5} />
          </>
        )}
      </svg>
      {ativo !== null && dados[ativo] && <ChartTooltip item={dados[ativo]} formatar={formatar} xPct={(x(ativo) / L) * 100} yPct={(y(dados[ativo].valor) / A) * 100} />}
      <ChartTable titulo={titulo} dados={dados} formatar={formatar} />
    </div>
  );
}
