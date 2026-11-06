"use client";

import Link from "next/link";
import { useState } from "react";
import { AcoesEdicao, Avatar, Button, Card, Field, Stars } from "@/components/ui";
import type { Restaurante } from "@/types";

export function CardLoja({ restaurante, onSalvar, ocupado }: { restaurante: Restaurante; ocupado: boolean; onSalvar: (c: { descricao: string; endereco: string; logo?: File }) => Promise<boolean> }) {
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [logo, setLogo] = useState<File>();

  function abrir() {
    setDescricao(restaurante.descricao);
    setEndereco(restaurante.endereco);
    setLogo(undefined);
    setEditando(true);
  }

  async function salvar() {
    if (await onSalvar({ descricao, endereco, logo })) setEditando(false);
  }

  return (
    <Card>
      <div className="loja-card">
        <div className="loja-card__info">
          <Avatar nome={restaurante.nomeEstabelecimento} src={restaurante.imagem} grande />
          <div className="loja-card__texto">
            <h2 className="card__title">{restaurante.nomeEstabelecimento}</h2>
            {editando ? (
              <div className="form-edicao">
                <Field rotulo="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                <Field as="textarea" rotulo="Descrição" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                <Field rotulo="Logo" type="file" accept="image/*" className="input-arquivo" onChange={(e) => setLogo(e.target.files?.[0])} />
                <AcoesEdicao desabilitado={ocupado} onCancelar={() => setEditando(false)} onSalvar={salvar} />
              </div>
            ) : (
              <>
                <p className="t-muted">{restaurante.endereco || "Sem endereço"}</p>
                <p>{restaurante.descricao || "Sem descrição"}</p>
                <Button pequeno icone="lapis" onClick={abrir}>Editar descrição e logo</Button>
              </>
            )}
          </div>
        </div>
        <Link href="/avaliacoes" className="nota-geral" aria-label="Ver avaliações">
          <span className="t-title t-small t-muted">Média geral</span>
          <span className="nota-geral__valor">{restaurante.notaMedia.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <Stars nota={restaurante.notaMedia} />
          <span className="t-small t-muted">{restaurante.totalAvaliacoes} avaliações</span>
        </Link>
      </div>
    </Card>
  );
}
