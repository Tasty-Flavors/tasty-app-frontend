"use client";

import { useEffect, useState } from "react";
import { Badge, Button, ButtonLink, Drawer, Field, ListaDados, Notice } from "@/components/ui";
import { formatarData, formatarHora, formatarMoeda } from "@/lib/format";
import { ROTULO_STATUS, TOM_STATUS } from "@/lib/pedidos";
import type { Entregador, Pedido, StatusPedido } from "@/types";

export function DetalhePedido({
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
          <ListaDados
            itens={[
              ["Cliente", pedido.cliente],
              ["Telefone", <a key="telefone" href={`tel:${pedido.telefone.replace(/\D/g, "")}`}>{pedido.telefone}</a>],
              ["Pagamento", pedido.pagamento],
              [pedido.tipo === "entrega" ? "Endereço" : "Tipo", pedido.tipo === "entrega" ? pedido.endereco : "Retirada no balcão"],
              ...(entregador ? ([["Entregador", entregador.nome]] as [string, string][]) : []),
            ]}
          />
          {pedido.observacao && (
            <Notice icone="mensagem">{pedido.observacao}</Notice>
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
              <Notice tom="perigo" acao={<ButtonLink pequeno href="/entregadores">Ver entregadores</ButtonLink>}>
                Nenhum entregador disponível no momento.
              </Notice>
            ))}
        </>
      )}
    </Drawer>
  );
}
