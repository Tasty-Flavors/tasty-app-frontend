"use client";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import type { Plano } from "@/types";

export function CartaoPlano({ plano, atual, onEscolher }: { plano: Plano; atual: boolean; onEscolher: () => void }) {
  return (
    <Card className={atual ? "plano plano--atual" : "plano"}>
      <div className="row row--between">
        <h2 className="card__title row row--compacta">
          {plano.id === "premium" && <Icon nome="coroa" tamanho={20} />}
          {plano.nome}
        </h2>
        {atual ? <Badge tom="marca" icone="check">Plano atual</Badge> : plano.destaque ? <Badge tom="info">Mais escolhido</Badge> : null}
      </div>
      <div>
        <div className="plano__preco">{plano.precoMensal === 0 ? "Sem mensalidade" : `${formatarMoeda(plano.precoMensal)}/mês`}</div>
        <div className="t-small t-muted">{formatarPercentual(plano.comissao)} de comissão por pedido</div>
      </div>
      <p>{plano.descricao}</p>
      <ul className="plano__recursos">
        {plano.recursos.map((r) => (
          <li key={r}>
            <Icon nome="check" tamanho={18} />
            {r}
          </li>
        ))}
      </ul>
      <Button variante={atual ? "secundario" : "primario"} bloco disabled={atual} onClick={onEscolher}>
        {atual ? "Plano atual" : `Mudar para ${plano.nome}`}
      </Button>
    </Card>
  );
}
