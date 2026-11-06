"use client";

import { useState } from "react";
import { type TipoMovimento, numero, FormMovimento } from "@/components/estoque/FormMovimento";
import { BadgeValidade } from "@/components/estoque/BadgeValidade";
import { BadgeStatus, Button, Card, CelulaTitulo, EmptyState, FiltroCategoria, KpiCard, LoadState, type MapaStatus, Notice, Pagina, Pills, Progresso, SearchInput, Tabela } from "@/components/ui";
import { abaixoDoMinimo, DIAS_ALERTA_VALIDADE, estaVencido, situacaoValidade, venceEmBreve } from "@/lib/estoque";
import { formatarData, formatarMoeda } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarEstoque, listarMovimentos, registrarMovimento } from "@/services/operacao";
import type { ItemEstoque } from "@/types";

type FiltroSituacao = "todos" | "abaixo" | "vencendo" | "vencidos" | "ok";

const ROTULO_MOVIMENTO: MapaStatus<TipoMovimento> = {
  entrada: { rotulo: "Entrada", tom: "sucesso" },
  saida: { rotulo: "Saída", tom: "neutro" },
  perda: { rotulo: "Perda", tom: "perigo" },
};

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
    <Pagina
        titulo="Estoque"
        subtitulo="Controle níveis, validade e movimentações dos insumos."
        acoes={<Button variante="primario" icone="mais" onClick={() => setItemMovimento(itens[0]?.id ?? "")}>Registrar movimento</Button>}
        aviso={aviso}
      >

      {vencidos.length > 0 && (
        <Notice tom="perigo" role="alert" titulo={vencidos.length === 1 ? "1 item vencido" : `${vencidos.length} itens vencidos`}>
          {vencidos.map((i) => i.nome).join(", ")}. Retire do uso e registre a perda.
        </Notice>
      )}
      {vencendo.length > 0 && (
        <Notice icone="relogio" titulo={`${vencendo.length === 1 ? "1 item vence" : `${vencendo.length} itens vencem`} em até ${DIAS_ALERTA_VALIDADE} dias`}>
          {vencendo.map((i) => `${i.nome} (${situacaoValidade(i.validade).rotulo.toLowerCase()})`).join(", ")}.
        </Notice>
      )}

      <div className="grid grid--4">
        <KpiCard rotulo="Abaixo do mínimo" valor={abaixo.length} perigo={abaixo.length > 0} detalhe="itens para repor" />
        <KpiCard rotulo={`Vencendo em até ${DIAS_ALERTA_VALIDADE} dias`} valor={vencendo.length} detalhe="itens" />
        <KpiCard rotulo="Vencidos" valor={vencidos.length} perigo={vencidos.length > 0} detalhe="itens" />
        <KpiCard rotulo="Valor em estoque" valor={formatarMoeda(valorTotal)} detalhe="pelo custo unitário" />
      </div>

      <div className="filtros">
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar item ou lote" />
        <FiltroCategoria valor={categoria} todas="todas" categorias={categorias} onChange={setCategoria} />
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
        <Tabela
          itens={visiveis}
          vazio={<EmptyState titulo="Nenhum item encontrado" descricao="Ajuste a busca ou os filtros." />}
          colunas={[
            { titulo: "Item", celula: (i) => <CelulaTitulo titulo={i.nome} apoio={<>Lote {i.lote} · {i.fornecedor}</>} /> },
            { titulo: "Categoria", celula: (i) => i.categoria },
            {
              titulo: "Nível vs mínimo",
              celula: (i) => {
                const baixo = abaixoDoMinimo(i);
                return (
                  <div className="nivel">
                    <span className={baixo ? "t-small t-danger" : "t-small"}>{numero(i.quantidade)} / {numero(i.minimo)} {i.unidade}</span>
                    <Progresso percentual={Math.min(100, (i.quantidade / Math.max(i.minimo, 0.0001)) * 50)} tom={baixo ? "perigo" : "sucesso"} />
                  </div>
                );
              },
            },
            {
              titulo: "Validade",
              celula: (i) => (
                <>
                  <div className="t-small">{formatarData(i.validade)}</div>
                  <BadgeValidade validade={i.validade} />
                </>
              ),
            },
            { titulo: "Valor", num: true, celula: (i) => formatarMoeda(i.quantidade * i.custoUnitario) },
            { titulo: "Ações", oculto: true, celula: (i) => <Button pequeno onClick={() => setItemMovimento(i.id)}>Registrar</Button> },
          ]}
        />
      </Card>

      <Card semPadding titulo="Histórico de movimentos">
        <Tabela
          itens={movimentos}
          vazio={<EmptyState titulo="Nenhum movimento registrado" />}
          colunas={[
            { titulo: "Data", celula: (m) => formatarData(m.data) },
            { titulo: "Item", celula: (m) => nomeItem(m.itemId) },
            { titulo: "Tipo", celula: (m) => <BadgeStatus mapa={ROTULO_MOVIMENTO} valor={m.tipo} /> },
            { titulo: "Quantidade", num: true, celula: (m) => numero(m.quantidade) },
            { titulo: "Motivo", celula: (m) => m.motivo },
          ]}
        />
      </Card>

      {itemMovimento !== null && <FormMovimento itens={itens} itemInicial={itemMovimento} ocupado={ocupado} onFechar={() => setItemMovimento(null)} onSalvar={salvarMovimento} />}
    </Pagina>
  );
}
