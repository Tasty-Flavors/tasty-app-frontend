"use client";

import { useState } from "react";
import type { SerieDiaria } from "@/types";
import { ChartTable, ChartTooltip } from "./ChartTable";
import { marcasEixo, passoRotulos, rotuloEixo } from "./escala";

const L = 720;
const A = 280;
const M = { topo: 12, dir: 8, base: 26, esq: 52 };
const LARGURA_MAX_BARRA = 24;
const RAIO = 4;

interface Props {
  titulo: string;
  dados: SerieDiaria[];
  formatar?: (v: number) => string;
}

export function BarChart({ titulo, dados, formatar = (v) => v.toLocaleString("pt-BR") }: Props) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const marcas = marcasEixo(Math.max(0, ...dados.map((d) => d.valor)));
  const topo = marcas[marcas.length - 1]!;
  const larguraPlot = L - M.esq - M.dir;
  const alturaPlot = A - M.topo - M.base;
  const banda = larguraPlot / Math.max(1, dados.length);
  const barra = Math.max(1, Math.min(LARGURA_MAX_BARRA, banda - 2));
  const y = (v: number) => M.topo + alturaPlot - (v / topo) * alturaPlot;
  const salto = passoRotulos(dados.length);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={titulo} onPointerLeave={() => setAtivo(null)}>
        {marcas.map((m) => (
          <g key={m}>
            <line className="chart__grid" x1={M.esq} x2={L - M.dir} y1={y(m)} y2={y(m)} />
            <text className="chart__axis" x={M.esq - 8} y={y(m) + 4} textAnchor="end">
              {rotuloEixo(m)}
            </text>
          </g>
        ))}
        {dados.map((d, i) => {
          const centro = M.esq + banda * i + banda / 2;
          const altura = Math.max(0, y(0) - y(d.valor));
          const raio = Math.min(RAIO, barra / 2, altura);
          const x = centro - barra / 2;
          const topoBarra = y(d.valor);
          return (
            <g key={`${d.rotulo}-${i}`}>
              <path
                className={ativo === null || ativo === i ? "chart__bar" : "chart__bar chart__bar--apagada"}
                d={`M${x} ${y(0)}V${topoBarra + raio}Q${x} ${topoBarra} ${x + raio} ${topoBarra}H${x + barra - raio}Q${x + barra} ${topoBarra} ${x + barra} ${topoBarra + raio}V${y(0)}Z`}
              />
              {i % salto === 0 && (
                <text className="chart__axis" x={centro} y={A - 8} textAnchor="middle">
                  {d.rotulo}
                </text>
              )}
              {/* A área de interação ocupa a banda inteira, maior que a barra. */}
              <rect
                className="chart__alvo"
                x={M.esq + banda * i}
                y={M.topo}
                width={banda}
                height={alturaPlot}
                tabIndex={dados.length <= 31 ? 0 : -1}
                aria-label={`${d.rotulo}: ${formatar(d.valor)}`}
                onPointerEnter={() => setAtivo(i)}
                onFocus={() => setAtivo(i)}
                onBlur={() => setAtivo(null)}
              />
            </g>
          );
        })}
      </svg>
      {ativo !== null && dados[ativo] && (
        <ChartTooltip item={dados[ativo]} formatar={formatar} xPct={((M.esq + banda * ativo + banda / 2) / L) * 100} yPct={(y(dados[ativo].valor) / A) * 100} />
      )}
      <ChartTable titulo={titulo} dados={dados} formatar={formatar} />
    </div>
  );
}
