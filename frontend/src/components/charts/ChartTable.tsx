import type { SerieDiaria } from "@/types";

/** Tabela para leitores de tela: o tooltip nunca é o único caminho até o valor. */
export function ChartTable({ titulo, dados, formatar }: { titulo: string; dados: SerieDiaria[]; formatar: (v: number) => string }) {
  return (
    <table className="sr-only">
      <caption>{titulo}</caption>
      <tbody>
        {dados.map((d, i) => (
          <tr key={`${d.rotulo}-${i}`}>
            <th scope="row">{d.rotulo}</th>
            <td>{formatar(d.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ChartTooltip({ item, formatar, xPct, yPct }: { item: SerieDiaria; formatar: (v: number) => string; xPct: number; yPct: number }) {
  return (
    <div className="chart__tooltip" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <strong>{formatar(item.valor)}</strong>
      {item.rotulo}
    </div>
  );
}
