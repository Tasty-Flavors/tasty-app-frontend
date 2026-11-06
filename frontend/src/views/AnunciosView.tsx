"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { KpiCard } from "@/components/ui/KpiCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { dataLocalParaIso, dataParaInput, formatarData, formatarMoeda, formatarNumero, formatarPercentual } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { alterarStatusAnuncio, criarAnuncio, listarAnuncios } from "@/services/marketing";
import type { Anuncio } from "@/types";

const STATUS: Record<Anuncio["status"], { rotulo: string; tom: TomBadge }> = {
  ativo: { rotulo: "Ativo", tom: "sucesso" },
  pausado: { rotulo: "Pausado", tom: "alerta" },
  encerrado: { rotulo: "Encerrado", tom: "neutro" },
};
const FORMATOS: Anuncio["formato"][] = ["Destaque na busca", "Banner na home", "Vitrine de categoria"];

const formVazio = () => ({ titulo: "", formato: FORMATOS[0]!, orcamentoDiario: "", inicio: dataParaInput(), fim: dataParaInput(30) });

export function AnunciosView() {
  const { data, setData, error, reload } = useAsync(listarAnuncios);
  const { executar, ocupado, aviso } = useAcao();
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState(formVazio);

  if (!data) return <LoadState titulo="Anúncios" erro={error} onTentarNovamente={reload} />;

  const gasto = data.reduce((s, a) => s + a.gasto, 0);
  const pedidos = data.reduce((s, a) => s + a.pedidos, 0);
  const impressoes = data.reduce((s, a) => s + a.impressoes, 0);
  const cliques = data.reduce((s, a) => s + a.cliques, 0);
  const erroDatas = form.fim < form.inicio ? "O fim deve ser depois do início" : undefined;
  const valido = form.titulo.trim() && Number(form.orcamentoDiario) > 0 && !erroDatas;

  async function salvar() {
    const novo = await executar(
      () =>
        criarAnuncio({
          titulo: form.titulo.trim(),
          formato: form.formato,
          orcamentoDiario: Number(form.orcamentoDiario),
          inicio: dataLocalParaIso(form.inicio),
          fim: dataLocalParaIso(form.fim),
        }),
      "Anúncio criado",
    );
    if (!novo) return;
    setData((d) => (d ? [novo, ...d] : d));
    setForm(formVazio());
    setCriando(false);
  }

  async function alternar(a: Anuncio) {
    const r = await executar(() => alterarStatusAnuncio(a.id, a.status === "ativo" ? "pausado" : "ativo"), a.status === "ativo" ? "Anúncio pausado" : "Anúncio retomado");
    if (r) setData(r);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Anúncios" subtitulo="Ganhe visibilidade dentro do app Tasty." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Novo anúncio</Button>} />
      <div className="grid grid--4">
        <KpiCard rotulo="Investido" valor={formatarMoeda(gasto)} />
        <KpiCard rotulo="Impressões" valor={formatarNumero(impressoes)} />
        <KpiCard rotulo="Taxa de clique" valor={formatarPercentual(impressoes ? cliques / impressoes : 0)} detalhe={`${formatarNumero(cliques)} cliques`} />
        <KpiCard rotulo="Pedidos gerados" valor={formatarNumero(pedidos)} detalhe={pedidos ? `${formatarMoeda(gasto / pedidos)} por pedido` : undefined} />
      </div>
      <Card semPadding>
        {data.length === 0 ? (
          <EmptyState titulo="Nenhum anúncio criado" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Anúncio</th>
                  <th>Período</th>
                  <th>Situação</th>
                  <th className="num">Orçamento/dia</th>
                  <th className="num">Gasto</th>
                  <th className="num">Cliques</th>
                  <th className="num">Pedidos</th>
                  <th><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="table__strong">{a.titulo}</div>
                      <div className="t-small t-muted">{a.formato}</div>
                    </td>
                    <td data-rotulo="Período" className="t-small">{formatarData(a.inicio)} a {formatarData(a.fim)}</td>
                    <td data-rotulo="Situação"><Badge tom={STATUS[a.status].tom}>{STATUS[a.status].rotulo}</Badge></td>
                    <td data-rotulo="Orçamento/dia" className="num">{formatarMoeda(a.orcamentoDiario)}</td>
                    <td data-rotulo="Gasto" className="num">{formatarMoeda(a.gasto)}</td>
                    <td data-rotulo="Cliques" className="num">{formatarNumero(a.cliques)}</td>
                    <td data-rotulo="Pedidos" className="num">{formatarNumero(a.pedidos)}</td>
                    <td>{a.status !== "encerrado" && <Button pequeno disabled={ocupado} onClick={() => alternar(a)}>{a.status === "ativo" ? "Pausar" : "Retomar"}</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Drawer
        aberto={criando}
        titulo="Novo anúncio"
        onFechar={() => setCriando(false)}
        rodape={
          <>
            <Button onClick={() => setCriando(false)}>Cancelar</Button>
            <Button variante="primario" disabled={ocupado || !valido} onClick={salvar}>Criar anúncio</Button>
          </>
        }
      >
        <Field rotulo="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        <Field as="select" rotulo="Formato" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value as Anuncio["formato"] })}>
          {FORMATOS.map((f) => <option key={f}>{f}</option>)}
        </Field>
        <Field rotulo="Orçamento diário (R$)" type="number" min={0} step="1" value={form.orcamentoDiario} onChange={(e) => setForm({ ...form, orcamentoDiario: e.target.value })} />
        <Field rotulo="Início" type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
        <Field rotulo="Fim" type="date" erro={erroDatas} value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} />
      </Drawer>
      <Toast aviso={aviso} />
    </div>
  );
}
