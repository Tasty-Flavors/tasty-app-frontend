"use client";

import { useState } from "react";
import { FormProduto } from "@/components/cardapios/FormProduto";
import { CartaoProduto } from "@/components/cardapios/CartaoProduto";
import { Button, Card, DrawerAcao, EmptyState, LoadState, Pagina, Pills, SearchInput } from "@/components/ui";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarProdutos, removerProduto, salvarProduto } from "@/services/operacao";
import type { Produto } from "@/types";

const TODAS = "Todas";

const PRODUTO_VAZIO: Produto = { id: "", nome: "", descricao: "", categoria: "", preco: 0, custo: 0, ativo: true, status: "processando", vendidos30d: 0 };

export function CardapiosView() {
  const { data, setData, error, reload } = useAsync(listarProdutos);
  const { executar, ocupado, aviso } = useAcao();
  const [categoria, setCategoria] = useState(TODAS);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Produto | null>(null);
  const [remover, setRemover] = useState<Produto | null>(null);

  if (!data) return <LoadState titulo="Cardápios" erro={error} onTentarNovamente={reload} />;

  const categorias = [...new Set(data.map((p) => p.categoria))].sort();
  const categoriaAtiva = categorias.includes(categoria) ? categoria : TODAS;
  const termo = busca.trim().toLowerCase();
  const visiveis = data.filter((p) => (categoriaAtiva === TODAS || p.categoria === categoriaAtiva) && (!termo || p.nome.toLowerCase().includes(termo)));
  const grupos = categorias.filter((c) => visiveis.some((p) => p.categoria === c));

  async function salvar(p: Produto, imagem?: File) {
    const r = await executar(() => salvarProduto(p, imagem), "Produto salvo");
    if (!r) return;
    setData(r);
    setEditando(null);
  }

  async function alternarPausa(p: Produto) {
    const ativo = !p.ativo;
    const r = await executar(() => salvarProduto({ ...p, ativo, status: ativo ? "aprovado" : "pausado" }), ativo ? "Produto reativado" : "Produto pausado");
    if (r) setData(r);
  }

  async function confirmarRemocao() {
    if (!remover) return;
    const r = await executar(() => removerProduto(remover.id), "Produto removido");
    if (r) setData(r);
    setRemover(null);
  }

  return (
    <Pagina titulo="Cardápios" subtitulo="Organize os produtos e categorias da sua loja." acoes={<Button variante="primario" icone="mais" onClick={() => setEditando(PRODUTO_VAZIO)}>Novo produto</Button>} aviso={aviso}>

      {data.length === 0 ? (
        <Card>
          <EmptyState icone="grade" titulo="Nenhuma categoria cadastrada" descricao="Cadastre um produto para criar a primeira categoria." acao={<Button variante="primario" icone="mais" onClick={() => setEditando(PRODUTO_VAZIO)}>Novo produto</Button>} />
        </Card>
      ) : (
        <>
          <div className="filtros">
            <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto" />
            <Pills<string> rotulo="Categoria" valor={categoriaAtiva} onChange={setCategoria} opcoes={[TODAS, ...categorias].map((c) => ({ valor: c, rotulo: c }))} />
          </div>
          {visiveis.length === 0 && <EmptyState icone="busca" titulo="Nenhum produto encontrado" />}
          {grupos.map((grupo) => (
            <Card key={grupo} titulo={grupo}>
              {visiveis
                .filter((p) => p.categoria === grupo)
                .map((p) => (
                  <CartaoProduto key={p.id} produto={p} ocupado={ocupado} onEditar={() => setEditando(p)} onRemover={() => setRemover(p)} onAlternarPausa={() => alternarPausa(p)} />
                ))}
            </Card>
          ))}
        </>
      )}

      {editando && <FormProduto key={editando.id || "novo"} inicial={editando} categorias={categorias} ocupado={ocupado} onFechar={() => setEditando(null)} onSalvar={salvar} />}
      <DrawerAcao aberto={Boolean(remover)} titulo="Remover produto" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>{remover?.nome} sairá do cardápio. Esta ação não pode ser desfeita.</p>
      </DrawerAcao>
    </Pagina>
  );
}
