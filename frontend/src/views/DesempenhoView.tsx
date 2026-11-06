"use client";

import { useState } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { BarrasHorizontais } from "@/components/desempenho/BarrasHorizontais";
import { Card, KpiCard, LoadState, Pagina, Pills } from "@/components/ui";
import { formatarMoeda, formatarNumero, formatarPercentual } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { obterDesempenho } from "@/services/negocio";

type Periodo = "7d" | "30d" | "90d";

const variacao = (atual: number, anterior: number) => (anterior > 0 ? (atual - anterior) / anterior : 0);

export function DesempenhoView() {
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const { data, error, reload } = useAsync(() => obterDesempenho(periodo), [periodo]);

  if (!data) return <LoadState titulo="Desempenho" erro={error} onTentarNovamente={reload} />;

  return (
    <Pagina
        titulo="Desempenho"
        subtitulo="Vendas e operação do período selecionado."
        acoes={
          <Pills<Periodo>
            rotulo="Período"
            valor={periodo}
            onChange={setPeriodo}
            opcoes={[
              { valor: "7d", rotulo: "7 dias" },
              { valor: "30d", rotulo: "30 dias" },
              { valor: "90d", rotulo: "90 dias" },
            ]}
          />
        }
      >
      <div className="grid grid--4">
        <KpiCard rotulo="Faturamento" valor={formatarMoeda(data.faturamento)} variacao={variacao(data.faturamento, data.faturamentoAnterior)} />
        <KpiCard rotulo="Pedidos" valor={formatarNumero(data.pedidos)} variacao={variacao(data.pedidos, data.pedidosAnterior)} />
        <KpiCard rotulo="Ticket médio" valor={formatarMoeda(data.ticketMedio)} variacao={variacao(data.ticketMedio, data.ticketMedioAnterior)} />
        <KpiCard rotulo="Tempo médio de preparo" valor={`${data.tempoMedioPreparoMin} min`} detalhe={`${formatarPercentual(data.taxaCancelamento)} de cancelamento`} />
      </div>
      <Card titulo="Faturamento por dia">
        <BarChart titulo="Faturamento por dia" dados={data.faturamentoPorDia} formatar={formatarMoeda} />
      </Card>
      <Card titulo="Pedidos por hora">
        <LineChart titulo="Pedidos por hora" dados={data.pedidosPorHora} formatar={(v) => `${formatarNumero(v)} pedidos`} />
      </Card>
      <div className="grid grid--2">
        <Card titulo="Mais vendidos" subtitulo="Por quantidade">
          <BarrasHorizontais itens={data.maisVendidos.map((m) => ({ nome: m.nome, valor: m.quantidade, rotulo: formatarNumero(m.quantidade) }))} />
        </Card>
        <Card titulo="Canais" subtitulo="Pedidos por origem">
          <BarrasHorizontais itens={data.canais.map((c) => ({ nome: c.nome, valor: c.pedidos, rotulo: formatarNumero(c.pedidos) }))} />
        </Card>
      </div>
    </Pagina>
  );
}
