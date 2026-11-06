"use client";

import { Badge, type TomBadge } from "@/components/ui";
import { situacaoValidade, type SituacaoValidade } from "@/lib/estoque";

const TOM_VALIDADE: Record<SituacaoValidade, TomBadge> = { vencido: "perigo", hoje: "perigo", proximo: "alerta", ok: "sucesso" };

export function BadgeValidade({ validade }: { validade: string }) {
  const v = situacaoValidade(validade);
  return <Badge tom={TOM_VALIDADE[v.situacao]} icone={v.situacao === "ok" ? "check" : "alerta"}>{v.rotulo}</Badge>;
}
