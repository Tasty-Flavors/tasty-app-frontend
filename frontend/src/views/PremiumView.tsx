"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confirmacao } from "@/components/ui/Drawer";
import { LoadState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarPlanos, trocarPlano } from "@/services/negocio";
import type { Plano } from "@/types";

export function PremiumView() {
  const { data, setData, error, reload } = useAsync(listarPlanos);
  const { executar, ocupado, aviso } = useAcao();
  const [escolhido, setEscolhido] = useState<Plano | null>(null);

  if (!data) return <LoadState titulo="Premium" erro={error} onTentarNovamente={reload} />;

  async function confirmar() {
    if (!escolhido) return;
    const alvo = escolhido;
    const r = await executar(() => trocarPlano(alvo.id), `Plano alterado para ${alvo.nome}`);
    if (r) setData(r);
    setEscolhido(null);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Premium" subtitulo="Compare os planos e escolha o melhor para a sua loja." />
      <div className="grid grid--3">
        {data.planos.map((plano) => {
          const atual = plano.id === data.atual;
          return (
            <Card key={plano.id} className={atual ? "plano plano--atual" : "plano"}>
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
              <Button variante={atual ? "secundario" : "primario"} bloco disabled={atual} onClick={() => setEscolhido(plano)}>
                {atual ? "Plano atual" : `Mudar para ${plano.nome}`}
              </Button>
            </Card>
          );
        })}
      </div>
      <Confirmacao aberto={Boolean(escolhido)} titulo={`Mudar para o plano ${escolhido?.nome ?? ""}`} rotuloConfirmar="Confirmar troca" ocupado={ocupado} onCancelar={() => setEscolhido(null)} onConfirmar={confirmar}>
        {escolhido && (
          <dl className="dl">
            <dt>Mensalidade</dt>
            <dd>{escolhido.precoMensal === 0 ? "Sem mensalidade" : formatarMoeda(escolhido.precoMensal)}</dd>
            <dt>Comissão</dt>
            <dd>{formatarPercentual(escolhido.comissao)} por pedido</dd>
          </dl>
        )}
      </Confirmacao>
      <Toast aviso={aviso} />
    </div>
  );
}
