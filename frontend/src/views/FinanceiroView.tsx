"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { KpiCard } from "@/components/ui/KpiCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { formatarData, formatarMoeda, formatarPercentual } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { listarFaturas, listarLancamentos, obterResumoFinanceiro } from "@/services/negocio";
import type { Fatura, Lancamento } from "@/types";

type FiltroTipo = "todos" | Lancamento["tipo"];

const STATUS_LANCAMENTO: Record<Lancamento["status"], { rotulo: string; tom: TomBadge }> = {
  liquidado: { rotulo: "Liquidado", tom: "sucesso" },
  previsto: { rotulo: "Previsto", tom: "info" },
  processando: { rotulo: "Processando", tom: "alerta" },
};

const STATUS_FATURA: Record<Fatura["status"], { rotulo: string; tom: TomBadge }> = {
  paga: { rotulo: "Paga", tom: "sucesso" },
  aberta: { rotulo: "Aberta", tom: "alerta" },
  atrasada: { rotulo: "Atrasada", tom: "perigo" },
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
    <div className="stack">
      <PageHeader titulo="Financeiro" subtitulo="Saldo, repasses, extrato e mensalidade." />
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
        {visiveis.length === 0 ? (
          <EmptyState icone="cifrao" titulo="Nenhum lançamento deste tipo" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Situação</th>
                  <th className="num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((l) => (
                  <tr key={l.id}>
                    <td>{formatarData(l.data)}</td>
                    <td>{l.descricao}</td>
                    <td><Badge tom={STATUS_LANCAMENTO[l.status].tom}>{STATUS_LANCAMENTO[l.status].rotulo}</Badge></td>
                    <td className={l.valor < 0 ? "num t-danger" : "num t-positive"}>{formatarMoeda(l.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card semPadding titulo="Faturas da mensalidade">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Vencimento</th>
                <th>Situação</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => (
                <tr key={f.id}>
                  <td className="table__strong">{f.competencia}</td>
                  <td>{formatarData(f.vencimento)}</td>
                  <td><Badge tom={STATUS_FATURA[f.status].tom}>{STATUS_FATURA[f.status].rotulo}</Badge></td>
                  <td className="num">{formatarMoeda(f.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
