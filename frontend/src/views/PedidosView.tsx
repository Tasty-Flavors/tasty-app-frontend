"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { formatarData, formatarHora, formatarMoeda, tempoDecorrido } from "@/lib/format";
import { ROTULO_STATUS, resumoItens, TOM_STATUS } from "@/lib/pedidos";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePolling } from "@/lib/usePolling";
import { usePreferencias } from "@/lib/usePreferencias";
import { atualizarStatusPedido, listarEntregadores, listarPedidos } from "@/services/operacao";
import type { Entregador, Pedido, StatusPedido, TipoPedido } from "@/types";

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

function CartaoPedido({ pedido, onAbrir }: { pedido: Pedido; onAbrir: () => void }) {
  return (
    <button type="button" className="pedido-card" onClick={onAbrir}>
      <span className="pedido-card__topo">
        <span className="t-num">#{pedido.numero}</span>
        <span className="t-small t-muted">{tempoDecorrido(pedido.criadoEm)}</span>
      </span>
      <span className="t-title">{pedido.cliente}</span>
      <span className="t-small t-muted">{resumoItens(pedido)}</span>
      <span className="pedido-card__topo">
        <Badge icone={pedido.tipo === "entrega" ? "moto" : "loja"}>{pedido.tipo === "entrega" ? "Entrega" : "Retirada"}</Badge>
        <span className="t-num">{formatarMoeda(pedido.total)}</span>
      </span>
    </button>
  );
}

function DetalhePedido({
  pedido, entregadores, ocupado, onFechar, onMudarStatus,
}: {
  pedido: Pedido | null;
  entregadores: Entregador[];
  ocupado: boolean;
  onFechar: () => void;
  onMudarStatus: (status: StatusPedido, extra?: Partial<Pedido>) => void;
}) {
  const [entregadorId, setEntregadorId] = useState("");
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const id = pedido?.id;

  useEffect(() => {
    setEntregadorId("");
    setRecusando(false);
    setMotivo("");
  }, [id]);

  const disponiveis = entregadores.filter((e) => e.status === "disponivel");
  const entregador = entregadores.find((e) => e.id === pedido?.entregadorId);

  function recusar() {
    if (!pedido) return;
    const motivoTexto = motivo.trim() && `Motivo da recusa: ${motivo.trim()}`;
    const observacao = [pedido.observacao, motivoTexto].filter(Boolean).join(" · ");
    onMudarStatus("recusado", observacao ? { observacao } : undefined);
  }

  function rodape() {
    if (!pedido) return null;
    switch (pedido.status) {
      case "novo":
        return recusando ? (
          <>
            <Button onClick={() => setRecusando(false)}>Voltar</Button>
            <Button variante="perigo" disabled={ocupado} onClick={recusar}>Confirmar recusa</Button>
          </>
        ) : (
          <>
            <Button variante="perigo" icone="fechar" onClick={() => setRecusando(true)}>Recusar</Button>
            <Button variante="primario" icone="check" disabled={ocupado} onClick={() => onMudarStatus("em_preparo")}>Aceitar</Button>
          </>
        );
      case "em_preparo":
        return <Button variante="primario" icone="check" disabled={ocupado} onClick={() => onMudarStatus("pronto")}>Marcar pronto</Button>;
      case "pronto":
        return pedido.tipo === "entrega" ? (
          <Button variante="primario" icone="moto" disabled={ocupado || !entregadorId} onClick={() => onMudarStatus("em_entrega", { entregadorId })}>Despachar</Button>
        ) : (
          <Button variante="primario" icone="check" disabled={ocupado} onClick={() => onMudarStatus("concluido")}>Concluir retirada</Button>
        );
      case "em_entrega":
        return <Button variante="primario" icone="check" disabled={ocupado} onClick={() => onMudarStatus("concluido")}>Concluir entrega</Button>;
      default:
        return null;
    }
  }

  return (
    <Drawer aberto={Boolean(pedido)} titulo={pedido ? `Pedido #${pedido.numero}` : ""} onFechar={onFechar} rodape={rodape()}>
      {pedido && (
        <>
          <div className="row row--between">
            <Badge tom={TOM_STATUS[pedido.status]}>{ROTULO_STATUS[pedido.status]}</Badge>
            <span className="t-small t-muted">{formatarData(pedido.criadoEm)}, {formatarHora(pedido.criadoEm)}</span>
          </div>
          <section className="stack stack--sm">
            <h3 className="kpi__label">Itens</h3>
            <ul className="pedido-itens">
              {pedido.itens.map((item) => (
                <li key={item.nome}>
                  <div>
                    {item.quantidade}× {item.nome}
                    {item.observacao && <div className="t-small t-warning">{item.observacao}</div>}
                  </div>
                  <span className="t-num">{formatarMoeda(item.quantidade * item.precoUnitario)}</span>
                </li>
              ))}
              {pedido.taxaEntrega > 0 && (
                <li className="t-muted">
                  <span>Taxa de entrega</span>
                  <span>{formatarMoeda(pedido.taxaEntrega)}</span>
                </li>
              )}
            </ul>
            <hr className="divider" />
            <div className="row row--between">
              <span className="kpi__label">Total</span>
              <span className="t-num">{formatarMoeda(pedido.total)}</span>
            </div>
          </section>
          <dl className="dl">
            <dt>Cliente</dt>
            <dd>{pedido.cliente}</dd>
            <dt>Telefone</dt>
            <dd><a href={`tel:${pedido.telefone.replace(/\D/g, "")}`}>{pedido.telefone}</a></dd>
            <dt>Pagamento</dt>
            <dd>{pedido.pagamento}</dd>
            <dt>{pedido.tipo === "entrega" ? "Endereço" : "Tipo"}</dt>
            <dd>{pedido.tipo === "entrega" ? pedido.endereco : "Retirada no balcão"}</dd>
            {entregador && (
              <>
                <dt>Entregador</dt>
                <dd>{entregador.nome}</dd>
              </>
            )}
          </dl>
          {pedido.observacao && (
            <div className="notice">
              <Icon nome="mensagem" />
              <span>{pedido.observacao}</span>
            </div>
          )}
          {pedido.status === "novo" && recusando && (
            <Field rotulo="Motivo da recusa (opcional)" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: fora da área de entrega" />
          )}
          {pedido.status === "pronto" && pedido.tipo === "entrega" &&
            (disponiveis.length > 0 ? (
              <Field as="select" rotulo="Entregador disponível" value={entregadorId} onChange={(e) => setEntregadorId(e.target.value)}>
                <option value="">Escolha um entregador</option>
                {disponiveis.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome} ({e.veiculo})</option>
                ))}
              </Field>
            ) : (
              <div className="notice notice--perigo">
                <Icon nome="alerta" />
                <div className="stack stack--sm">
                  <span>Nenhum entregador disponível no momento.</span>
                  <div><ButtonLink pequeno href="/entregadores">Ver entregadores</ButtonLink></div>
                </div>
              </div>
            ))}
        </>
      )}
    </Drawer>
  );
}

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
    <div className="stack">
      <PageHeader
        titulo="Pedidos"
        subtitulo="Acompanhe e movimente os pedidos em tempo real."
        acoes={
          <label className="row t-small">
            Alerta sonoro
            <Toggle ligado={prefs.alertaSonoro} rotulo="Alerta sonoro para pedido novo" onChange={(v) => atualizar({ alertaSonoro: v })} />
          </label>
        }
      />
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
          {historico.length === 0 ? (
            <EmptyState icone="pedidos" titulo="Nenhum pedido no histórico" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Horário</th>
                    <th>Situação</th>
                    <th className="num">Total</th>
                    <th><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((p) => (
                    <tr key={p.id}>
                      <td className="table__strong">#{p.numero}</td>
                      <td>{p.cliente}</td>
                      <td>{p.tipo === "entrega" ? "Entrega" : "Retirada"}</td>
                      <td>{formatarHora(p.criadoEm)}</td>
                      <td><Badge tom={TOM_STATUS[p.status]} icone={p.status === "concluido" ? "check" : "fechar"}>{ROTULO_STATUS[p.status]}</Badge></td>
                      <td className="num">{formatarMoeda(p.total)}</td>
                      <td><Button pequeno onClick={() => setSelecionadoId(p.id)}>Detalhes</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <DetalhePedido pedido={selecionado} entregadores={data.entregadores} ocupado={ocupado} onFechar={() => setSelecionadoId(null)} onMudarStatus={mudarStatus} />
      <Toast aviso={aviso} />
    </div>
  );
}
