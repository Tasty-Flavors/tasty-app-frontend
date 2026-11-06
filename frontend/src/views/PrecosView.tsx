"use client";

import { useState } from "react";
import { Badge, Button, Card, EmptyState, Field, FiltroCategoria, KpiCard, LoadState, Pagina, SearchInput, Tabela } from "@/components/ui";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { atualizarPrecos, listarProdutos } from "@/services/operacao";
import type { Produto } from "@/types";

const MARGEM_MINIMA = 0.5;
const TODAS = "todas";

const margem = (preco: number, custo: number) => (preco > 0 ? (preco - custo) / preco : 0);
const arredondar = (v: number) => Math.round(v * 100) / 100;

export function PrecosView() {
  const { data, setData, error, reload } = useAsync(listarProdutos);
  const { executar, ocupado, aviso, setAviso } = useAcao();
  /** Preços em edição, como texto, para permitir digitar valores intermediários. */
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS);
  const [categoriaReajuste, setCategoriaReajuste] = useState(TODAS);
  const [percentual, setPercentual] = useState("");

  if (!data) return <LoadState titulo="Preços" erro={error} onTentarNovamente={reload} />;
  const produtos = data;

  const precoAtual = (p: Produto) => (p.id in rascunho ? Number(rascunho[p.id]) : p.preco);
  const margemBaixaDe = (p: Produto) => margem(precoAtual(p), p.custo) < MARGEM_MINIMA;
  const categorias = [...new Set(produtos.map((p) => p.categoria))].sort();
  const termo = busca.trim().toLowerCase();
  const visiveis = produtos.filter((p) => (categoriaFiltro === TODAS || p.categoria === categoriaFiltro) && (!termo || p.nome.toLowerCase().includes(termo)));

  const alterados = produtos.filter((p) => p.id in rascunho && Number(rascunho[p.id]) !== p.preco);
  const temInvalido = alterados.some((p) => !(Number(rascunho[p.id]) > 0));
  const margemBaixa = produtos.filter(margemBaixaDe);
  const margemMedia = produtos.reduce((s, p) => s + margem(precoAtual(p), p.custo), 0) / Math.max(1, produtos.length);

  function aplicarReajuste() {
    const fator = 1 + Number(percentual) / 100;
    if (!percentual || fator <= 0) {
      setAviso({ texto: "Informe um percentual válido", tipo: "erro" });
      return;
    }
    const alvo = produtos.filter((p) => categoriaReajuste === TODAS || p.categoria === categoriaReajuste);
    setRascunho((r) => {
      const novo = { ...r };
      alvo.forEach((p) => {
        novo[p.id] = arredondar(precoAtual(p) * fator).toFixed(2);
      });
      return novo;
    });
    setPercentual("");
    setAviso({ texto: `Reajuste aplicado a ${alvo.length} itens. Revise e salve.`, tipo: "sucesso" });
  }

  async function salvar() {
    const alteracoes = alterados.map((p) => ({ id: p.id, preco: arredondar(Number(rascunho[p.id])) }));
    const r = await executar(() => atualizarPrecos(alteracoes), `${alteracoes.length} ${alteracoes.length === 1 ? "preço atualizado" : "preços atualizados"}`);
    if (!r) return;
    setData(r);
    setRascunho({});
  }

  return (
    <Pagina
        titulo="Preços"
        subtitulo="Ajuste preços acompanhando custo, margem e lucro por item."
        acoes={
          <>
            <Button disabled={Object.keys(rascunho).length === 0} onClick={() => setRascunho({})}>Descartar</Button>
            <Button variante="primario" icone="check" disabled={alterados.length === 0 || temInvalido || ocupado} onClick={salvar}>
              Salvar alterações{alterados.length > 0 ? ` (${alterados.length})` : ""}
            </Button>
          </>
        }
        aviso={aviso}
      >

      <div className="grid grid--3">
        <KpiCard rotulo="Margem média" valor={formatarPercentual(margemMedia)} />
        <KpiCard rotulo="Itens com margem baixa" valor={margemBaixa.length} perigo={margemBaixa.length > 0} detalhe={`abaixo de ${formatarPercentual(MARGEM_MINIMA)}`} />
        <KpiCard rotulo="Alterações pendentes" valor={alterados.length} detalhe="ainda não salvas" />
      </div>

      <Card titulo="Reajuste em massa" subtitulo="Aplica o percentual aos preços em edição; nada é salvo até você confirmar.">
        <div className="form-grid">
          <Field as="select" rotulo="Categoria" value={categoriaReajuste} onChange={(e) => setCategoriaReajuste(e.target.value)}>
            <option value={TODAS}>Todas as categorias</option>
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </Field>
          <Field rotulo="Reajuste (%)" type="number" step="0.5" placeholder="Ex.: 5 ou -3" value={percentual} onChange={(e) => setPercentual(e.target.value)} />
          <div className="field field--acao">
            <Button icone="porcentagem" onClick={aplicarReajuste}>Aplicar</Button>
          </div>
        </div>
      </Card>

      <div className="filtros">
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto" />
        <FiltroCategoria valor={categoriaFiltro} todas={TODAS} categorias={categorias} onChange={setCategoriaFiltro} />
      </div>

      <Card semPadding>
        <Tabela
          itens={visiveis}
          vazio={<EmptyState icone="etiqueta" titulo="Nenhum produto encontrado" />}
          classeLinha={(p) => (margemBaixaDe(p) ? "linha--margem-baixa" : undefined)}
          colunas={[
            { titulo: "Produto", classe: "table__strong", celula: (p) => p.nome },
            { titulo: "Categoria", celula: (p) => p.categoria },
            { titulo: "Custo", num: true, celula: (p) => formatarMoeda(p.custo) },
            {
              titulo: "Preço",
              num: true,
              celula: (p) => (
                <input
                  className="field__control field__control--compacto table__input"
                  type="number"
                  min="0"
                  step="0.5"
                  aria-label={`Preço de ${p.nome}`}
                  value={rascunho[p.id] ?? p.preco.toFixed(2)}
                  onChange={(e) => setRascunho((r) => ({ ...r, [p.id]: e.target.value }))}
                />
              ),
            },
            { titulo: "Margem", num: true, classe: (p) => (margemBaixaDe(p) ? "t-danger" : undefined), celula: (p) => formatarPercentual(margem(precoAtual(p), p.custo)) },
            { titulo: "Lucro", num: true, celula: (p) => formatarMoeda(precoAtual(p) - p.custo) },
            {
              titulo: "Avisos",
              oculto: true,
              celula: (p) => (
                <div className="tag-lista">
                  {margemBaixaDe(p) && <Badge tom="perigo" icone="alerta">Margem baixa</Badge>}
                  {p.id in rascunho && Number(rascunho[p.id]) !== p.preco && <Badge tom="info" icone="lapis">Alterado</Badge>}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </Pagina>
  );
}
