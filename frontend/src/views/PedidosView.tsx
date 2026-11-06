"use client";

import { useRef, useState } from "react";
import { CartaoPedido } from "@/components/pedidos/CartaoPedido";
import { DetalhePedido } from "@/components/pedidos/DetalhePedido";
import { Badge, Button, Card, EmptyState, LoadState, Pagina, Pills, SearchInput, Tabela, Toggle } from "@/components/ui";
import { formatarHora, formatarMoeda } from "@/lib/format";
import { ROTULO_STATUS, TOM_STATUS } from "@/lib/pedidos";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePolling } from "@/lib/usePolling";
import { usePreferencias } from "@/lib/usePreferencias";
import { atualizarStatusPedido, listarEntregadores, listarPedidos } from "@/services/operacao";
import type { Pedido, StatusPedido, TipoPedido } from "@/types";

const COLUNAS: { status: StatusPedido; titulo: string }[] = [
  { status: "novo", titulo: "Novos" },
  { status: "em_preparo", titulo: "Em preparo" },
  { status: "pronto", titulo: "Prontos" },
  { status: "em_entrega", titulo: "Em entrega" },
];

type Aba = "quadro" | "historico";
type FiltroTipo = "todos" | TipoPedido;
type FiltroHistorico = "todos" | "concluido" | "recusado";

const INTERVALO_MS = 5000;

export function PedidosView() {
  const { data, setData, error, reload } = useAsync(async () => {
    const [pedidos, entregadores] = await Promise.all([listarPedidos(), listarEntregadores()]);
    return { pedidos, entregadores };
  });
  const { executar, ocupado, aviso } = useAcao();
  const { prefs, atualizar } = usePreferencias();
  const [aba, setAba] = useState<Aba>("quadro");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [busca, setBusca] = useState("");
  const [filtroHistorico, setFiltroHistorico] = useState<FiltroHistorico>("todos");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  /** Descarta leituras do polling que começaram antes da última ação. */
  const versao = useRef(0);

  async function atualizarTudo() {
    const inicio = versao.current;
    const [pedidos, entregadores] = await Promise.all([listarPedidos(), listarEntregadores()]);
    if (inicio === versao.current) setData({ pedidos, entregadores });
  }

  usePolling(atualizarTudo, INTERVALO_MS);

  if (!data) return <LoadState titulo="Pedidos" erro={error} onTentarNovamente={reload} />;

  const termo = busca.trim().toLowerCase();
  const filtrados = data.pedidos.filter(
    (p) => (tipo === "todos" || p.tipo === tipo) && (!termo || p.cliente.toLowerCase().includes(termo) || String(p.numero).includes(termo)),
  );
  const historico = filtrados.filter((p) => (filtroHistorico === "todos" ? p.status === "concluido" || p.status === "recusado" : p.status === filtroHistorico));
  const selecionado = data.pedidos.find((p) => p.id === selecionadoId) ?? null;

  async function mudarStatus(status: StatusPedido, extra?: Partial<Pedido>) {
    if (!selecionado) return;
    versao.current += 1;
    const ok = await executar(() => atualizarStatusPedido(selecionado.id, status, extra), `Pedido #${selecionado.numero}: ${ROTULO_STATUS[status].toLowerCase()}`);
    if (!ok) return;
    if (status === "recusado" || status === "concluido" || status === "em_entrega") setSelecionadoId(null);
    versao.current += 1;
    await atualizarTudo().catch(() => undefined);
  }

  return (
    <Pagina
        titulo="Pedidos"
        subtitulo="Acompanhe e movimente os pedidos em tempo real."
        acoes={
          <label className="row t-small">
            Alerta sonoro
            <Toggle ligado={prefs.alertaSonoro} rotulo="Alerta sonoro para pedido novo" onChange={(v) => atualizar({ alertaSonoro: v })} />
          </label>
        }
        aviso={aviso}
      >
      <div className="filtros">
        <Pills<Aba>
          rotulo="Visualização"
          valor={aba}
          onChange={setAba}
          opcoes={[
            { valor: "quadro", rotulo: "Quadro" },
            { valor: "historico", rotulo: "Histórico" },
          ]}
        />
        <div className="row">
          <Pills<FiltroTipo>
            rotulo="Tipo de pedido"
            valor={tipo}
            onChange={setTipo}
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              { valor: "entrega", rotulo: "Entrega" },
              { valor: "retirada", rotulo: "Retirada" },
            ]}
          />
        </div>
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar por cliente ou número" />
      </div>

      {aba === "quadro" ? (
        <div className="quadro">
          {COLUNAS.map((coluna) => {
            const lista = filtrados.filter((p) => p.status === coluna.status);
            return (
              <section key={coluna.status} className="quadro__coluna" aria-label={coluna.titulo}>
                <h2 className="quadro__titulo">
                  {coluna.titulo}
                  <span className="pill__count">{lista.length}</span>
                </h2>
                {lista.length === 0 ? (
                  <p className="quadro__vazio">Nenhum pedido</p>
                ) : (
                  lista.map((p) => <CartaoPedido key={p.id} pedido={p} onAbrir={() => setSelecionadoId(p.id)} />)
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <Card
          semPadding
          titulo="Histórico"
          acao={
            <Pills<FiltroHistorico>
              rotulo="Situação do pedido"
              valor={filtroHistorico}
              onChange={setFiltroHistorico}
              opcoes={[
                { valor: "todos", rotulo: "Todos" },
                { valor: "concluido", rotulo: "Concluídos" },
                { valor: "recusado", rotulo: "Recusados" },
              ]}
            />
          }
        >
          <Tabela
            itens={historico}
            vazio={<EmptyState icone="pedidos" titulo="Nenhum pedido no histórico" />}
            colunas={[
              { titulo: "Pedido", classe: "table__strong", celula: (p) => <>#{p.numero}</> },
              { titulo: "Cliente", celula: (p) => p.cliente },
              { titulo: "Tipo", celula: (p) => (p.tipo === "entrega" ? "Entrega" : "Retirada") },
              { titulo: "Horário", celula: (p) => formatarHora(p.criadoEm) },
              { titulo: "Situação", celula: (p) => <Badge tom={TOM_STATUS[p.status]} icone={p.status === "concluido" ? "check" : "fechar"}>{ROTULO_STATUS[p.status]}</Badge> },
              { titulo: "Total", num: true, celula: (p) => formatarMoeda(p.total) },
              { titulo: "Ações", oculto: true, celula: (p) => <Button pequeno onClick={() => setSelecionadoId(p.id)}>Detalhes</Button> },
            ]}
          />
        </Card>
      )}

      <DetalhePedido pedido={selecionado} entregadores={data.entregadores} ocupado={ocupado} onFechar={() => setSelecionadoId(null)} onMudarStatus={mudarStatus} />
    </Pagina>
  );
}
