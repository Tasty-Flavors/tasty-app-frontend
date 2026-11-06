"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, CelulaTitulo, DrawerAcao, EmptyState, Field, LoadState, Pagina, Pills, SearchInput, Tabela, type TomBadge } from "@/components/ui";
import { formatarData, formatarMoeda, mascaraTelefone } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { useFormulario } from "@/lib/useFormulario";
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
  const { form, setForm, campo } = useFormulario({ nome: "", telefone: "", bairro: "" });

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
    <Pagina titulo="Seus Clientes" subtitulo="Conheça quem compra de você." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Adicionar cliente</Button>} aviso={aviso}>
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
        <Tabela
          itens={visiveis}
          vazio={<EmptyState icone="usuario" titulo="Nenhum cliente encontrado" />}
          colunas={[
            {
              titulo: "Cliente",
              celula: (c) => (
                <div className="row">
                  <Avatar nome={c.nome} />
                  <div>
                    <CelulaTitulo titulo={c.nome} apoio={c.telefone} />
                  </div>
                </div>
              ),
            },
            { titulo: "Bairro", celula: (c) => c.bairro || "—" },
            { titulo: "Segmento", celula: (c) => <Badge tom={TOM[c.segmento]}>{c.segmento}</Badge> },
            { titulo: "Pedidos", num: true, celula: (c) => c.pedidos },
            { titulo: "Total gasto", num: true, celula: (c) => formatarMoeda(c.totalGasto) },
            { titulo: "Último pedido", celula: (c) => (c.pedidos > 0 ? formatarData(c.ultimoPedido) : "—") },
          ]}
        />
      </Card>
      <DrawerAcao aberto={criando} titulo="Adicionar cliente" rotuloConfirmar="Salvar" ocupado={ocupado} confirmarDesabilitado={!valido} onCancelar={() => setCriando(false)} onConfirmar={salvar}>
        <Field rotulo="Nome" {...campo("nome")} />
        <Field rotulo="Telefone" inputMode="tel" {...campo("telefone", mascaraTelefone)} />
        <Field rotulo="Bairro" {...campo("bairro")} />
      </DrawerAcao>
    </Pagina>
  );
}
