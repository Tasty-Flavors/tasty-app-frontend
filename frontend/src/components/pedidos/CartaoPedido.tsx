"use client";

import { Badge } from "@/components/ui";
import { formatarMoeda, tempoDecorrido } from "@/lib/format";
import { resumoItens } from "@/lib/pedidos";
import type { Pedido } from "@/types";

export function CartaoPedido({ pedido, onAbrir }: { pedido: Pedido; onAbrir: () => void }) {
  return (
    <button type="button" className="pedido-card" onClick={onAbrir}>
      <span className="pedido-card__topo">
        <span className="t-num">#{pedido.numero}</span>
        <span className="t-small t-muted">{tempoDecorrido(pedido.criadoEm)}</span>
      </span>
      <span className="t-title">{pedido.cliente}</span>
      <span className="t-small t-muted">{resumoItens(pedido)}</span>
      <span className="pedido-card__topo">
        <Badge icone={pedido.tipo === "entrega" ? "moto" : "loja"}>{pedido.tipo === "entrega" ? "Entrega" : "Retirada"}</Badge>
        <span className="t-num">{formatarMoeda(pedido.total)}</span>
      </span>
    </button>
  );
}
