"use client";

export interface OpcaoPill<T extends string> {
  valor: T;
  rotulo: string;
  contagem?: number;
}

export function Pills<T extends string>({ opcoes, valor, onChange, rotulo }: { opcoes: OpcaoPill<T>[]; valor: T; onChange: (v: T) => void; rotulo: string }) {
  return (
    <div className="pills" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button key={o.valor} type="button" className="pill" aria-pressed={o.valor === valor} onClick={() => onChange(o.valor)}>
          {o.rotulo}
          {o.contagem !== undefined && <span className="pill__count">{o.contagem}</span>}
        </button>
      ))}
    </div>
  );
}
