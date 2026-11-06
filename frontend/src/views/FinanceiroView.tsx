"use client";

import { useState } from "react";
import { BadgeStatus, Card, EmptyState, KpiCard, LoadState, type MapaStatus, Pagina, Pills, Tabela } from "@/components/ui";
import { formatarData, formatarMoeda, formatarPercentual } from "@/lib/format";
import { STATUS_FATURA } from "@/lib/opcoes";
import { useAsync } from "@/lib/useAsync";
import { listarFaturas, listarLancamentos, obterResumoFinanceiro } from "@/services/negocio";
import type { Lancamento } from "@/types";

type FiltroTipo = "todos" | Lancamento["tipo"];

const STATUS_LANCAMENTO: MapaStatus<Lancamento["status"]> = {
  liquidado: { rotulo: "Liquidado", tom: "sucesso" },
  previsto: { rotulo: "Previsto", tom: "info" },
  processando: { rotulo: "Processando", tom: "alerta" },
};

export function FinanceiroView() {
  const { data, error, reload } = useAsync(async () => {
    const [resumo, lancamentos, faturas] = await Promise.all([obterResumoFinanceiro(), listarLancamentos(), listarFaturas()]);
    return { resumo, lancamentos, faturas };
  });
  const [tipo, setTipo] = useState<FiltroTipo>("todos");

  if (!data) return <LoadState titulo="Financeiro" erro={error} onTentarNovamente={reload} />;
  const { resumo, lancamentos, faturas } = data;
  const visiveis = lancamentos.filter((l) => tipo === "todos" || l.tipo === tipo);

  return (
    <Pagina titulo="Financeiro" subtitulo="Saldo, repasses, extrato e mensalidade.">
      <div className="grid grid--3">
        <KpiCard rotulo="Saldo a receber" valor={formatarMoeda(resumo.saldoAReceber)} detalhe="previsto e em processamento" />
        <KpiCard rotulo="Próximo repasse" valor={formatarMoeda(resumo.proximoRepasse.valor)} detalhe={`em ${formatarData(resumo.proximoRepasse.data)}`} />
        <KpiCard rotulo="Comissão" valor={formatarPercentual(resumo.comissao.percentual)} detalhe={`Plano ${resumo.comissao.plano} · ${formatarMoeda(resumo.comissao.valorPeriodo)} no período`} />
      </div>

      <Card
        semPadding
        titulo="Extrato de lançamentos"
        acao={
          <Pills<FiltroTipo>
            rotulo="Tipo de lançamento"
            valor={tipo}
            onChange={setTipo}
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              { valor: "venda", rotulo: "Vendas" },
              { valor: "taxa", rotulo: "Taxas" },
              { valor: "repasse", rotulo: "Repasses" },
              { valor: "estorno", rotulo: "Estornos" },
            ]}
          />
        }
      >
        <Tabela
          itens={visiveis}
          vazio={<EmptyState icone="cifrao" titulo="Nenhum lançamento deste tipo" />}
          colunas={[
            { titulo: "Data", celula: (l) => formatarData(l.data) },
            { titulo: "Descrição", celula: (l) => l.descricao },
            { titulo: "Situação", celula: (l) => <BadgeStatus mapa={STATUS_LANCAMENTO} valor={l.status} /> },
            { titulo: "Valor", num: true, classe: (l) => (l.valor < 0 ? "t-danger" : "t-positive"), celula: (l) => formatarMoeda(l.valor) },
          ]}
        />
      </Card>

      <Card semPadding titulo="Faturas da mensalidade">
        <Tabela
          itens={faturas}
          colunas={[
            { titulo: "Competência", classe: "table__strong", celula: (f) => f.competencia },
            { titulo: "Vencimento", celula: (f) => formatarData(f.vencimento) },
            { titulo: "Situação", celula: (f) => <BadgeStatus mapa={STATUS_FATURA} valor={f.status} /> },
            { titulo: "Valor", num: true, celula: (f) => formatarMoeda(f.valor) },
          ]}
        />
      </Card>
    </Pagina>
  );
}
