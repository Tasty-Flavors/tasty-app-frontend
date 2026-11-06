"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { indicarParceria, listarParcerias, solicitarParceria } from "@/services/marketing";
import type { Parceria } from "@/types";

const STATUS: Record<Parceria["status"], { rotulo: string; tom: TomBadge }> = {
  ativa: { rotulo: "Ativa", tom: "sucesso" },
  disponivel: { rotulo: "Disponível", tom: "info" },
  pendente: { rotulo: "Em análise", tom: "alerta" },
};
const TIPOS: Parceria["tipo"][] = ["Fornecedor", "Bebidas", "Embalagens", "Benefícios", "Pagamentos"];
const FORM_VAZIO = { nome: "", tipo: TIPOS[0]!, descricao: "", beneficio: "" };

export function ParceriasView() {
  const { data, setData, error, reload } = useAsync(listarParcerias);
  const { executar, ocupado, aviso } = useAcao();
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);

  if (!data) return <LoadState titulo="Parcerias" erro={error} onTentarNovamente={reload} />;

  async function solicitar(id: string) {
    const r = await executar(() => solicitarParceria(id), "Solicitação enviada");
    if (r) setData(r);
  }

  async function salvar() {
    const nova = await executar(() => indicarParceria({ ...form, nome: form.nome.trim() }), "Indicação enviada para análise");
    if (!nova) return;
    setData((d) => (d ? [nova, ...d] : d));
    setForm(FORM_VAZIO);
    setCriando(false);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Parcerias" subtitulo="Benefícios com fornecedores e serviços para a sua loja." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Indicar parceiro</Button>} />
      {data.length === 0 ? (
        <EmptyState titulo="Nenhuma parceria disponível" />
      ) : (
        <div className="grid grid--3">
          {data.map((p) => (
            <Card key={p.id} className="plano">
              <div className="row row--between">
                <h2 className="card__title">{p.nome}</h2>
                <Badge tom={STATUS[p.status].tom}>{STATUS[p.status].rotulo}</Badge>
              </div>
              <span className="t-small t-muted">{p.tipo}</span>
              <p>{p.descricao}</p>
              <p className="t-title t-small">{p.beneficio}</p>
              {p.status === "disponivel" && <div><Button pequeno disabled={ocupado} onClick={() => solicitar(p.id)}>Solicitar parceria</Button></div>}
            </Card>
          ))}
        </div>
      )}
      <Drawer
        aberto={criando}
        titulo="Indicar parceiro"
        onFechar={() => setCriando(false)}
        rodape={
          <>
            <Button onClick={() => setCriando(false)}>Cancelar</Button>
            <Button variante="primario" disabled={ocupado || !form.nome.trim() || !form.descricao.trim()} onClick={salvar}>Enviar indicação</Button>
          </>
        }
      >
        <Field rotulo="Nome do parceiro" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Field as="select" rotulo="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Parceria["tipo"] })}>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </Field>
        <Field as="textarea" rotulo="Descrição" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        <Field rotulo="Benefício esperado" value={form.beneficio} onChange={(e) => setForm({ ...form, beneficio: e.target.value })} />
      </Drawer>
      <Toast aviso={aviso} />
    </div>
  );
}
