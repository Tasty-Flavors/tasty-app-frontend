"use client";

import { useState } from "react";
import { DrawerAcao, Field, Pills } from "@/components/ui";
import type { ItemEstoque, MovimentoEstoque } from "@/types";

export type TipoMovimento = MovimentoEstoque["tipo"];

export const numero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export function FormMovimento({
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
    <DrawerAcao aberto titulo="Registrar movimento" rotuloConfirmar="Registrar" ocupado={ocupado} onCancelar={onFechar} onConfirmar={salvar}>
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
    </DrawerAcao>
  );
}
