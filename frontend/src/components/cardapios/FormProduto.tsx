"use client";

import { useState } from "react";
import { DrawerAcao, Field } from "@/components/ui";
import { useFormulario } from "@/lib/useFormulario";
import type { Produto } from "@/types";

export function FormProduto({
  inicial, categorias, ocupado, onFechar, onSalvar,
}: {
  inicial: Produto;
  categorias: string[];
  ocupado: boolean;
  onFechar: () => void;
  onSalvar: (p: Produto, imagem?: File) => void;
}) {
  const { form, campo } = useFormulario({ ...inicial, preco: inicial.id ? String(inicial.preco) : "", custo: inicial.id ? String(inicial.custo) : "" });
  const [imagem, setImagem] = useState<File>();
  const valido = form.nome.trim() && form.categoria.trim() && Number(form.preco) > 0 && Number(form.custo) >= 0;

  return (
    <DrawerAcao
      aberto
      titulo={inicial.id ? "Editar produto" : "Novo produto"}
      rotuloConfirmar="Salvar"
      ocupado={ocupado}
      confirmarDesabilitado={!valido}
      onCancelar={onFechar}
      onConfirmar={() => onSalvar({ ...form, nome: form.nome.trim(), categoria: form.categoria.trim(), preco: Number(form.preco), custo: Number(form.custo), status: form.ativo ? "processando" : "pausado" }, imagem)}
    >
      <Field rotulo="Nome" {...campo("nome")} />
      <Field as="textarea" rotulo="Descrição" rows={3} {...campo("descricao")} />
      <Field rotulo="Categoria" list="categorias-cardapio" {...campo("categoria")} />
      <datalist id="categorias-cardapio">
        {categorias.map((c) => <option key={c} value={c} />)}
      </datalist>
      <Field rotulo="Preço (R$)" type="number" min={0} step="0.5" {...campo("preco")} />
      <Field rotulo="Custo (R$)" type="number" min={0} step="0.1" {...campo("custo")} />
      <Field rotulo="Imagem" type="file" accept="image/*" className="input-arquivo" onChange={(e) => setImagem(e.target.files?.[0])} />
      <p className="t-small t-muted">Alterações passam por análise: o produto fica como Processando até ser aprovado.</p>
    </DrawerAcao>
  );
}
