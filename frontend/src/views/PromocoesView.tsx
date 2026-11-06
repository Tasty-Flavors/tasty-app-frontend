"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { Toast } from "@/components/ui/Toast";
import { dataLocalParaIso, dataParaInput, formatarData, formatarMoeda, formatarNumero } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { criarPromocao, encerrarPromocao, listarPromocoes } from "@/services/marketing";
import type { Promocao } from "@/types";

type Filtro = "todas" | Promocao["status"];

const STATUS: Record<Promocao["status"], { rotulo: string; tom: TomBadge }> = {
  ativa: { rotulo: "Ativa", tom: "sucesso" },
  agendada: { rotulo: "Agendada", tom: "info" },
  encerrada: { rotulo: "Encerrada", tom: "neutro" },
};

const TIPOS: Record<Promocao["tipo"], string> = { percentual: "Desconto em %", valor: "Desconto em R$", frete_gratis: "Frete grátis", combo: "Combo" };

function descreverBeneficio(p: Promocao) {
  switch (p.tipo) {
    case "percentual": return `${p.valor}% de desconto`;
    case "valor": return `${formatarMoeda(p.valor)} de desconto`;
    case "frete_gratis": return "Frete grátis";
    case "combo": return `Combo por ${formatarMoeda(p.valor)}`;
  }
}

const formVazio = () => ({ titulo: "", tipo: "percentual" as Promocao["tipo"], valor: "", aplicaEm: "", inicio: dataParaInput(), fim: dataParaInput(7) });

export function PromocoesView() {
  const { data, setData, error, reload } = useAsync(listarPromocoes);
  const { executar, ocupado, aviso } = useAcao();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState(formVazio);

  if (!data) return <LoadState titulo="Promoções" erro={error} onTentarNovamente={reload} />;

  const visiveis = data.filter((p) => filtro === "todas" || p.status === filtro);
  const semValor = form.tipo === "frete_gratis";
  const erroDatas = form.fim < form.inicio ? "O fim deve ser depois do início" : undefined;
  const valido = form.titulo.trim() && form.aplicaEm.trim() && (semValor || Number(form.valor) > 0) && !erroDatas;

  async function salvar() {
    const nova = await executar(
      () =>
        criarPromocao({
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          valor: semValor ? 0 : Number(form.valor),
          aplicaEm: form.aplicaEm.trim(),
          inicio: dataLocalParaIso(form.inicio),
          fim: dataLocalParaIso(form.fim),
        }),
      "Promoção criada",
    );
    if (!nova) return;
    setData((d) => (d ? [nova, ...d] : d));
    setForm(formVazio());
    setCriando(false);
  }

  async function encerrar(id: string) {
    const r = await executar(() => encerrarPromocao(id), "Promoção encerrada");
    if (r) setData(r);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Promoções" subtitulo="Crie ofertas e acompanhe o resultado." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Nova promoção</Button>} />
      <Pills<Filtro>
        rotulo="Situação"
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: "todas", rotulo: "Todas" },
          { valor: "ativa", rotulo: "Ativas" },
          { valor: "agendada", rotulo: "Agendadas" },
          { valor: "encerrada", rotulo: "Encerradas" },
        ]}
      />
      <Card semPadding>
        {visiveis.length === 0 ? (
          <EmptyState icone="porcentagem" titulo="Nenhuma promoção neste filtro" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Promoção</th>
                  <th>Vale para</th>
                  <th>Período</th>
                  <th>Situação</th>
                  <th className="num">Usos</th>
                  <th className="num">Receita</th>
                  <th><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table__strong">{p.titulo}</div>
                      <div className="t-small t-muted">{descreverBeneficio(p)}</div>
                    </td>
                    <td>{p.aplicaEm}</td>
                    <td className="t-small">{formatarData(p.inicio)} a {formatarData(p.fim)}</td>
                    <td><Badge tom={STATUS[p.status].tom}>{STATUS[p.status].rotulo}</Badge></td>
                    <td className="num">{formatarNumero(p.usos)}</td>
                    <td className="num">{formatarMoeda(p.receitaGerada)}</td>
                    <td>{p.status !== "encerrada" && <Button pequeno disabled={ocupado} onClick={() => encerrar(p.id)}>Encerrar</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Drawer
        aberto={criando}
        titulo="Nova promoção"
        onFechar={() => setCriando(false)}
        rodape={
          <>
            <Button onClick={() => setCriando(false)}>Cancelar</Button>
            <Button variante="primario" disabled={ocupado || !valido} onClick={salvar}>Criar promoção</Button>
          </>
        }
      >
        <Field rotulo="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        <Field as="select" rotulo="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Promocao["tipo"] })}>
          {Object.entries(TIPOS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </Field>
        {!semValor && (
          <Field rotulo={form.tipo === "percentual" ? "Desconto (%)" : form.tipo === "combo" ? "Preço do combo (R$)" : "Desconto (R$)"} type="number" min={0} step="0.5" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        )}
        <Field rotulo="Vale para" placeholder="Ex.: Sobremesas" value={form.aplicaEm} onChange={(e) => setForm({ ...form, aplicaEm: e.target.value })} />
        <Field rotulo="Início" type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
        <Field rotulo="Fim" type="date" erro={erroDatas} value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} />
      </Drawer>
      <Toast aviso={aviso} />
    </div>
  );
}
