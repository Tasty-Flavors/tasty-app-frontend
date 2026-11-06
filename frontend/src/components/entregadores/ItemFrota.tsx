"use client";

import { Avatar, BadgeStatus, type MapaStatus } from "@/components/ui";
import { previsaoDeChegada, tempoDecorrido } from "@/lib/format";
import type { Entregador, Pedido, StatusEntregador } from "@/types";

const STATUS: MapaStatus<StatusEntregador> = {
  disponivel: { rotulo: "Disponível", tom: "sucesso" },
  em_entrega: { rotulo: "Em entrega", tom: "marca" },
  offline: { rotulo: "Offline", tom: "neutro" },
};

export function ItemFrota({ entregador: e, pedido, selecionado, onSelecionar }: { entregador: Entregador; pedido?: Pedido; selecionado: boolean; onSelecionar: () => void }) {
  return (
    <button type="button" className="entregador-item" aria-pressed={selecionado} onClick={onSelecionar}>
      <Avatar nome={e.nome} />
      <span className="min-0 stack--flex">
        <span className="row row--between">
          <span className="t-title">{e.nome}</span>
          <BadgeStatus mapa={STATUS} valor={e.status} />
        </span>
        <span className="t-small t-muted">
          {pedido ? `Pedido #${pedido.numero}` : "Sem pedido em curso"} · {e.entregasHoje} entregas hoje · ★ {e.avaliacao.toLocaleString("pt-BR")}
        </span>
        {e.status === "em_entrega" && e.chegadaEm && (
          <span className="t-small">
            {previsaoDeChegada(e.chegadaEm)}
            {e.rota?.some((p) => p.transito) && " · trânsito na rota"}
          </span>
        )}
        <span className="t-small t-muted">Atualizado {tempoDecorrido(e.atualizadoEm)}</span>
      </span>
    </button>
  );
}
