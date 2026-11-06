"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { KpiCard } from "@/components/ui/KpiCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { abaixoDoMinimo, DIAS_ALERTA_VALIDADE, estaVencido, situacaoValidade, venceEmBreve, type SituacaoValidade } from "@/lib/estoque";
import { formatarData, formatarMoeda } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarEstoque, listarMovimentos, registrarMovimento } from "@/services/operacao";
import type { ItemEstoque, MovimentoEstoque } from "@/types";

type FiltroSituacao = "todos" | "abaixo" | "vencendo" | "vencidos" | "ok";
type TipoMovimento = MovimentoEstoque["tipo"];

const TOM_VALIDADE: Record<SituacaoValidade, TomBadge> = { vencido: "perigo", hoje: "perigo", proximo: "alerta", ok: "sucesso" };
const ROTULO_MOVIMENTO: Record<TipoMovimento, { rotulo: string; tom: TomBadge }> = {
  entrada: { rotulo: "Entrada", tom: "sucesso" },
  saida: { rotulo: "Saída", tom: "neutro" },
  perda: { rotulo: "Perda", tom: "perigo" },
};

const numero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function BadgeValidade({ validade }: { validade: string }) {
  const v = situacaoValidade(validade);
  return <Badge tom={TOM_VALIDADE[v.situacao]} icone={v.situacao === "ok" ? "check" : "alerta"}>{v.rotulo}</Badge>;
}

function FormMovimento({
  itens, itemInicial, ocupado, onFechar, onSalvar,
}: {
  itens: ItemEstoque[];
  itemInicial: string;
  ocupado: boolean;
  onFechar: () => void;
  onSalvar: (m: { itemId: string; tipo: TipoMovimento; quantidade: number; motivo: string }) => void;
}) {
  const [itemId, setItemId] = useState(itemInicial);
  const [tipo, setTipo] = useState<TipoMovimento>("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tentou, setTentou] = useState(false);
  const item = itens.find((i) => i.id === itemId);
  const qtd = Number(quantidade);

  let erroQtd: string | undefined;
  if (!(qtd > 0)) erroQtd = "Informe uma quantidade maior que zero";
  else if (tipo !== "entrada" && item && qtd > item.quantidade) erroQtd = `Só há ${numero(item.quantidade)} ${item.unidade} em estoque`;
  const erroMotivo = !motivo.trim() ? "Informe o motivo" : undefined;

  function salvar() {
    setTentou(true);
    if (erroQtd || erroMotivo) return;
    onSalvar({ itemId, tipo, quantidade: qtd, motivo: motivo.trim() });
  }

  return (
    <Drawer
      aberto
      titulo="Registrar movimento"
      onFechar={onFechar}
      rodape={
        <>
          <Button onClick={onFechar}>Cancelar</Button>
          <Button variante="primario" disabled={ocupado} onClick={salvar}>Registrar</Button>
        </>
      }
    >
      <Field as="select" rotulo="Item" value={itemId} onChange={(e) => setItemId(e.target.value)}>
        {itens.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
      </Field>
      <Pills<TipoMovimento>
        rotulo="Tipo de movimento"
        valor={tipo}
        onChange={setTipo}
        opcoes={[
          { valor: "entrada", rotulo: "Entrada" },
          { valor: "saida", rotulo: "Saída" },
          { valor: "perda", rotulo: "Perda" },
        ]}
      />
      <Field
        rotulo={`Quantidade${item ? ` (${item.unidade})` : ""}`}
        type="number"
        min={0}
        step={item?.unidade === "kg" || item?.unidade === "L" ? "0.1" : "1"}
        dica={item ? `Em estoque: ${numero(item.quantidade)} ${item.unidade}` : undefined}
        erro={tentou ? erroQtd : undefined}
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <Field rotulo="Motivo" placeholder="Ex.: Compra NF 4421" erro={tentou ? erroMotivo : undefined} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
    </Drawer>
  );
}

export function EstoqueView() {
  const { data, setData, error, reload } = useAsync(async () => {
    const [itens, movimentos] = await Promise.all([listarEstoque(), listarMovimentos()]);
    return { itens, movimentos };
  });
  const { executar, ocupado, aviso } = useAcao();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todos");
  const [itemMovimento, setItemMovimento] = useState<string | null>(null);

  if (!data) return <LoadState titulo="Estoque" erro={error} onTentarNovamente={reload} />;
  const { itens, movimentos } = data;

  const vencidos = itens.filter(estaVencido);
  const vencendo = itens.filter(venceEmBreve);
  const abaixo = itens.filter(abaixoDoMinimo);
  const valorTotal = itens.reduce((s, i) => s + i.quantidade * i.custoUnitario, 0);
  const categorias = [...new Set(itens.map((i) => i.categoria))].sort();
  const termo = busca.trim().toLowerCase();

  const passaSituacao = (i: ItemEstoque) => {
    switch (situacao) {
      case "abaixo": return abaixoDoMinimo(i);
      case "vencendo": return venceEmBreve(i);
      case "vencidos": return estaVencido(i);
      case "ok": return !abaixoDoMinimo(i) && !venceEmBreve(i) && !estaVencido(i);
      default: return true;
    }
  };
  const visiveis = itens.filter(
    (i) => (categoria === "todas" || i.categoria === categoria) && passaSituacao(i) && (!termo || i.nome.toLowerCase().includes(termo) || i.lote.toLowerCase().includes(termo)),
  );
  const nomeItem = (id: string) => itens.find((i) => i.id === id)?.nome ?? "Item removido";

  async function salvarMovimento(m: { itemId: string; tipo: TipoMovimento; quantidade: number; motivo: string }) {
    const r = await executar(() => registrarMovimento(m), `${ROTULO_MOVIMENTO[m.tipo].rotulo} registrada`);
    if (!r) return;
    setData({ itens: r.estoque, movimentos: r.movimentos });
    setItemMovimento(null);
  }

  return (
    <div className="stack">
      <PageHeader
        titulo="Estoque"
        subtitulo="Controle níveis, validade e movimentações dos insumos."
        acoes={<Button variante="primario" icone="mais" onClick={() => setItemMovimento(itens[0]?.id ?? "")}>Registrar movimento</Button>}
      />

      {vencidos.length > 0 && (
        <div className="notice notice--perigo" role="alert">
          <Icon nome="alerta" />
          <div>
            <p className="notice__title">{vencidos.length === 1 ? "1 item vencido" : `${vencidos.length} itens vencidos`}</p>
            <p>{vencidos.map((i) => i.nome).join(", ")}. Retire do uso e registre a perda.</p>
          </div>
        </div>
      )}
      {vencendo.length > 0 && (
        <div className="notice">
          <Icon nome="relogio" />
          <div>
            <p className="notice__title">{vencendo.length === 1 ? "1 item vence" : `${vencendo.length} itens vencem`} em até {DIAS_ALERTA_VALIDADE} dias</p>
            <p>{vencendo.map((i) => `${i.nome} (${situacaoValidade(i.validade).rotulo.toLowerCase()})`).join(", ")}.</p>
          </div>
        </div>
      )}

      <div className="grid grid--4">
        <KpiCard rotulo="Abaixo do mínimo" valor={abaixo.length} perigo={abaixo.length > 0} detalhe="itens para repor" />
        <KpiCard rotulo={`Vencendo em até ${DIAS_ALERTA_VALIDADE} dias`} valor={vencendo.length} detalhe="itens" />
        <KpiCard rotulo="Vencidos" valor={vencidos.length} perigo={vencidos.length > 0} detalhe="itens" />
        <KpiCard rotulo="Valor em estoque" valor={formatarMoeda(valorTotal)} detalhe="pelo custo unitário" />
      </div>

      <div className="filtros">
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar item ou lote" />
        <select className="field__control" aria-label="Filtrar por categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Pills<FiltroSituacao>
          rotulo="Filtrar por situação"
          valor={situacao}
          onChange={setSituacao}
          opcoes={[
            { valor: "todos", rotulo: "Todos" },
            { valor: "abaixo", rotulo: "Abaixo do mínimo", contagem: abaixo.length },
            { valor: "vencendo", rotulo: "Vencendo", contagem: vencendo.length },
            { valor: "vencidos", rotulo: "Vencidos", contagem: vencidos.length },
            { valor: "ok", rotulo: "Ok" },
          ]}
        />
      </div>

      <Card semPadding>
        {visiveis.length === 0 ? (
          <EmptyState titulo="Nenhum item encontrado" descricao="Ajuste a busca ou os filtros." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Categoria</th>
                  <th>Nível vs mínimo</th>
                  <th>Validade</th>
                  <th className="num">Valor</th>
                  <th><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((i) => {
                  const baixo = abaixoDoMinimo(i);
                  const pct = Math.min(100, (i.quantidade / Math.max(i.minimo, 0.0001)) * 50);
                  return (
                    <tr key={i.id}>
                      <td>
                        <div className="table__strong">{i.nome}</div>
                        <div className="t-small t-muted">Lote {i.lote} · {i.fornecedor}</div>
                      </td>
                      <td>{i.categoria}</td>
                      <td>
                        <div className="nivel">
                          <span className={baixo ? "t-small t-danger" : "t-small"}>{numero(i.quantidade)} / {numero(i.minimo)} {i.unidade}</span>
                          <div className="progress" aria-hidden="true">
                            <div className={`progress__bar ${baixo ? "progress__bar--perigo" : "progress__bar--sucesso"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="t-small">{formatarData(i.validade)}</div>
                        <BadgeValidade validade={i.validade} />
                      </td>
                      <td className="num">{formatarMoeda(i.quantidade * i.custoUnitario)}</td>
                      <td><Button pequeno onClick={() => setItemMovimento(i.id)}>Registrar</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card semPadding titulo="Histórico de movimentos">
        {movimentos.length === 0 ? (
          <EmptyState titulo="Nenhum movimento registrado" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th className="num">Quantidade</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimentos.map((m) => (
                  <tr key={m.id}>
                    <td>{formatarData(m.data)}</td>
                    <td>{nomeItem(m.itemId)}</td>
                    <td><Badge tom={ROTULO_MOVIMENTO[m.tipo].tom}>{ROTULO_MOVIMENTO[m.tipo].rotulo}</Badge></td>
                    <td className="num">{numero(m.quantidade)}</td>
                    <td>{m.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {itemMovimento !== null && <FormMovimento itens={itens} itemInicial={itemMovimento} ocupado={ocupado} onFechar={() => setItemMovimento(null)} onSalvar={salvarMovimento} />}
      <Toast aviso={aviso} />
    </div>
  );
}
