"use client";

import { Progresso } from "@/components/ui";

export function BarrasHorizontais({ itens }: { itens: { nome: string; valor: number; rotulo: string }[] }) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <div>
      {itens.map((i) => (
        <div key={i.nome} className="hbar">
          <span className="hbar__nome" title={i.nome}>{i.nome}</span>
          <Progresso percentual={(i.valor / maximo) * 100} />
          <span className="t-num t-right">{i.rotulo}</span>
        </div>
      ))}
    </div>
  );
}
