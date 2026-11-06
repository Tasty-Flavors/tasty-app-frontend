import type { ReactNode } from "react";
import { formatarPercentual } from "@/lib/format";
import { Card } from "./Card";
import { Icon } from "./Icon";

interface Props {
  rotulo: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  /** Variação em fração (0,12 = +12%) em relação ao período anterior. */
  variacao?: number;
  /** Para métricas em que subir é ruim (ex.: cancelamentos). */
  inverterVariacao?: boolean;
  /** Destaca o valor como problema (ex.: itens vencidos). */
  perigo?: boolean;
}

export function KpiCard({ rotulo, valor, detalhe, variacao, inverterVariacao, perigo }: Props) {
  const positivo = variacao !== undefined && (inverterVariacao ? variacao <= 0 : variacao >= 0);
  return (
    <Card>
      <div className="kpi">
        <span className="kpi__label">{rotulo}</span>
        <span className={perigo ? "kpi__value t-danger" : "kpi__value"}>{valor}</span>
        {variacao !== undefined && (
          <span className={`kpi__detail ${positivo ? "kpi__detail--alta" : "kpi__detail--baixa"}`}>
            <Icon nome={variacao >= 0 ? "tendencia-alta" : "tendencia-baixa"} />
            {variacao >= 0 ? "+" : ""}
            {formatarPercentual(variacao)} vs período anterior
          </span>
        )}
        {detalhe && <span className="kpi__detail">{detalhe}</span>}
      </div>
    </Card>
  );
}
