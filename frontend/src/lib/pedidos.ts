import type { Pedido, StatusPedido } from "@/types";
import type { TomBadge } from "@/components/ui/Badge";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  novo: "Novo",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  em_entrega: "Em entrega",
  concluido: "Concluído",
  recusado: "Recusado",
};

export const TOM_STATUS: Record<StatusPedido, TomBadge> = {
  novo: "marca",
  em_preparo: "alerta",
  pronto: "info",
  em_entrega: "info",
  concluido: "sucesso",
  recusado: "perigo",
};

export const resumoItens = (p: Pedido) => p.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(", ");
