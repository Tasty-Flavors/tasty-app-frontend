"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confirmacao, Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { formatarMoeda } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarProdutos, removerProduto, salvarProduto } from "@/services/operacao";
import type { Produto, StatusProduto } from "@/types";

const STATUS: Record<StatusProduto, { rotulo: string; tom: TomBadge }> = {
  aprovado: { rotulo: "Aprovado", tom: "sucesso" },
  processando: { rotulo: "Processando", tom: "alerta" },
  editando: { rotulo: "Em edição", tom: "info" },
  pausado: { rotulo: "Pausado", tom: "neutro" },
};
const TODAS = "Todas";

const PRODUTO_VAZIO: Produto = { id: "", nome: "", descricao: "", categoria: "", preco: 0, custo: 0, ativo: true, status: "processando", vendidos30d: 0 };

function FormProduto({
  inicial, categorias, ocupado, onFechar, onSalvar,
}: {
  inicial: Produto;
  categorias: string[];
  ocupado: boolean;
  onFechar: () => void;
  onSalvar: (p: Produto, imagem?: File) => void;
}) {
  const [form, setForm] = useState({ ...inicial, preco: inicial.id ? String(inicial.preco) : "", custo: inicial.id ? String(inicial.custo) : "" });
  const [imagem, setImagem] = useState<File>();
  const valido = form.nome.trim() && form.categoria.trim() && Number(form.preco) > 0 && Number(form.custo) >= 0;

  return (
    <Drawer
      aberto
      titulo={inicial.id ? "Editar produto" : "Novo produto"}
      onFechar={onFechar}
      rodape={
        <>
          <Button onClick={onFechar}>Cancelar</Button>
          <Button
            variante="primario"
            disabled={ocupado || !valido}
            onClick={() => onSalvar({ ...form, nome: form.nome.trim(), categoria: form.categoria.trim(), preco: Number(form.preco), custo: Number(form.custo), status: form.ativo ? "processando" : "pausado" }, imagem)}
          >
            Salvar
          </Button>
        </>
      }
    >
      <Field rotulo="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      <Field as="textarea" rotulo="Descrição" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
      <Field rotulo="Categoria" list="categorias-cardapio" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
      <datalist id="categorias-cardapio">
        {categorias.map((c) => <option key={c} value={c} />)}
      </datalist>
      <Field rotulo="Preço (R$)" type="number" min={0} step="0.5" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
      <Field rotulo="Custo (R$)" type="number" min={0} step="0.1" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} />
      <Field rotulo="Imagem" type="file" accept="image/*" className="input-arquivo" onChange={(e) => setImagem(e.target.files?.[0])} />
      <p className="t-small t-muted">Alterações passam por análise: o produto fica como Processando até ser aprovado.</p>
    </Drawer>
  );
}

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
    <div className="stack">
      <PageHeader titulo="Cardápios" subtitulo="Organize os produtos e categorias da sua loja." acoes={<Button variante="primario" icone="mais" onClick={() => setEditando(PRODUTO_VAZIO)}>Novo produto</Button>} />

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
                  <article key={p.id} className="produto">
                    <div className="produto__imagem">
                      {p.imagem ? <Image src={p.imagem} alt={p.nome} width={96} height={96} unoptimized /> : <Icon nome="imagem" />}
                    </div>
                    <div className="produto__corpo">
                      <h3 className="kpi__label">{p.nome}</h3>
                      <p className="t-small t-muted">{p.descricao}</p>
                      <span className="t-num">{formatarMoeda(p.preco)}</span>
                      <div className="tag-lista">
                        <Badge tom={STATUS[p.status].tom}>{STATUS[p.status].rotulo}</Badge>
                        <Badge>{p.categoria}</Badge>
                      </div>
                    </div>
                    <div className="produto__acoes">
                      <div className="row row--compacta">
                        <IconButton icone="lapis" rotulo={`Editar ${p.nome}`} onClick={() => setEditando(p)} />
                        <IconButton icone="lixeira" rotulo={`Remover ${p.nome}`} onClick={() => setRemover(p)} />
                      </div>
                      <Button pequeno disabled={ocupado} onClick={() => alternarPausa(p)}>{p.ativo ? "Pausar" : "Reativar"}</Button>
                    </div>
                  </article>
                ))}
            </Card>
          ))}
        </>
      )}

      {editando && <FormProduto key={editando.id || "novo"} inicial={editando} categorias={categorias} ocupado={ocupado} onFechar={() => setEditando(null)} onSalvar={salvar} />}
      <Confirmacao aberto={Boolean(remover)} titulo="Remover produto" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>{remover?.nome} sairá do cardápio. Esta ação não pode ser desfeita.</p>
      </Confirmacao>
      <Toast aviso={aviso} />
    </div>
  );
}
