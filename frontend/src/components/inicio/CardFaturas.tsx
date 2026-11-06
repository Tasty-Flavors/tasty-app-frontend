"use client";

import { BadgeStatus, ButtonLink, Card } from "@/components/ui";
import { formatarData } from "@/lib/format";
import { STATUS_FATURA } from "@/lib/opcoes";
import type { Fatura } from "@/types";

export function CardFaturas({ faturas }: { faturas: Fatura[] }) {
  return (
    <Card titulo="Últimas faturas" acao={<ButtonLink variante="fantasma" pequeno href="/financeiro">Ver todas</ButtonLink>}>
      <ul className="lista-simples">
        {faturas.slice(0, 3).map((f) => (
          <li key={f.id}>
            <div className="min-0">
              <div>{f.competencia}</div>
              <div className="t-small t-muted">Vence em {formatarData(f.vencimento)}</div>
            </div>
            <BadgeStatus mapa={STATUS_FATURA} valor={f.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
