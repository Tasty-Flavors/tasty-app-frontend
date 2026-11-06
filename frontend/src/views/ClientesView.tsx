"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { formatarData, formatarMoeda, mascaraTelefone } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { criarCliente, listarClientes } from "@/services/marketing";
import type { Cliente } from "@/types";

type Filtro = "Todos" | Cliente["segmento"];

const TOM: Record<Cliente["segmento"], TomBadge> = { Novo: "info", Recorrente: "neutro", Fiel: "sucesso", Inativo: "alerta" };
const SEGMENTOS: Cliente["segmento"][] = ["Novo", "Recorrente", "Fiel", "Inativo"];

export function ClientesView() {
  const { data, setData, error, reload } = useAsync(listarClientes);
  const { executar, ocupado, aviso } = useAcao();
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [busca, setBusca] = useState("");
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", bairro: "" });

  if (!data) return <LoadState titulo="Seus Clientes" erro={error} onTentarNovamente={reload} />;

  const termo = busca.trim().toLowerCase();
  const visiveis = data.filter((c) => (filtro === "Todos" || c.segmento === filtro) && (!termo || c.nome.toLowerCase().includes(termo) || c.bairro.toLowerCase().includes(termo)));
  const valido = form.nome.trim() && form.telefone.replace(/\D/g, "").length >= 10;

  async function salvar() {
    const novo = await executar(() => criarCliente(form), "Cliente adicionado");
    if (!novo) return;
    setData((d) => (d ? [novo, ...d] : d));
    setForm({ nome: "", telefone: "", bairro: "" });
    setCriando(false);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Seus Clientes" subtitulo="Conheça quem compra de você." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Adicionar cliente</Button>} />
      <div className="filtros">
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar por nome ou bairro" />
        <Pills<Filtro>
          rotulo="Segmento"
          valor={filtro}
          onChange={setFiltro}
          opcoes={[
            { valor: "Todos", rotulo: "Todos", contagem: data.length },
            ...SEGMENTOS.map((s) => ({ valor: s as Filtro, rotulo: s, contagem: data.filter((c) => c.segmento === s).length })),
          ]}
        />
      </div>
      <Card semPadding>
        {visiveis.length === 0 ? (
          <EmptyState icone="usuario" titulo="Nenhum cliente encontrado" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Bairro</th>
                  <th>Segmento</th>
                  <th className="num">Pedidos</th>
                  <th className="num">Total gasto</th>
                  <th>Último pedido</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="row">
                        <Avatar nome={c.nome} />
                        <div>
                          <div className="table__strong">{c.nome}</div>
                          <div className="t-small t-muted">{c.telefone}</div>
                        </div>
                      </div>
                    </td>
                    <td data-rotulo="Bairro">{c.bairro || "—"}</td>
                    <td data-rotulo="Segmento"><Badge tom={TOM[c.segmento]}>{c.segmento}</Badge></td>
                    <td data-rotulo="Pedidos" className="num">{c.pedidos}</td>
                    <td data-rotulo="Total gasto" className="num">{formatarMoeda(c.totalGasto)}</td>
                    <td data-rotulo="Último pedido">{c.pedidos > 0 ? formatarData(c.ultimoPedido) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Drawer
        aberto={criando}
        titulo="Adicionar cliente"
        onFechar={() => setCriando(false)}
        rodape={
          <>
            <Button onClick={() => setCriando(false)}>Cancelar</Button>
            <Button variante="primario" disabled={ocupado || !valido} onClick={salvar}>Salvar</Button>
          </>
        }
      >
        <Field rotulo="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Field rotulo="Telefone" inputMode="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: mascaraTelefone(e.target.value) })} />
        <Field rotulo="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
      </Drawer>
      <Toast aviso={aviso} />
    </div>
  );
}
