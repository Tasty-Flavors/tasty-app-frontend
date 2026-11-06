"use client";

import { BadgeStatus, Button, Card, type MapaStatus } from "@/components/ui";
import type { Parceria } from "@/types";

const STATUS: MapaStatus<Parceria["status"]> = {
  ativa: { rotulo: "Ativa", tom: "sucesso" },
  disponivel: { rotulo: "Disponível", tom: "info" },
  pendente: { rotulo: "Em análise", tom: "alerta" },
};

export function CartaoParceria({ parceria: p, ocupado, onSolicitar }: { parceria: Parceria; ocupado: boolean; onSolicitar: () => void }) {
  return (
    <Card className="plano">
      <div className="row row--between">
        <h2 className="card__title">{p.nome}</h2>
        <BadgeStatus mapa={STATUS} valor={p.status} />
      </div>
      <span className="t-small t-muted">{p.tipo}</span>
      <p>{p.descricao}</p>
      <p className="t-title t-small">{p.beneficio}</p>
      {p.status === "disponivel" && <div><Button pequeno disabled={ocupado} onClick={onSolicitar}>Solicitar parceria</Button></div>}
    </Card>
  );
}
