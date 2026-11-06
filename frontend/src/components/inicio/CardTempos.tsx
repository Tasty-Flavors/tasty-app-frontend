"use client";

import { useState } from "react";
import { AcoesEdicao, Button, Card, Field, ListaDados } from "@/components/ui";
import type { Restaurante } from "@/types";

export function CardTempos({ restaurante, onSalvar, ocupado }: { restaurante: Restaurante; ocupado: boolean; onSalvar: (retirada: number, entrega: number) => Promise<boolean> }) {
  const [editando, setEditando] = useState(false);
  const [retirada, setRetirada] = useState("");
  const [entrega, setEntrega] = useState("");

  function abrir() {
    setRetirada(String(restaurante.tempoRetiradaMin));
    setEntrega(String(restaurante.tempoEntregaMin));
    setEditando(true);
  }

  const valido = Number(retirada) > 0 && Number(entrega) > 0;

  return (
    <Card titulo="Configurações de retirada">
      {editando ? (
        <div className="form-edicao">
          <Field rotulo="Tempo de retirada (min)" type="number" min={1} value={retirada} onChange={(e) => setRetirada(e.target.value)} />
          <Field rotulo="Tempo de entrega (min)" type="number" min={1} value={entrega} onChange={(e) => setEntrega(e.target.value)} />
          <AcoesEdicao
            desabilitado={ocupado || !valido}
            onCancelar={() => setEditando(false)}
            onSalvar={async () => {
              if (await onSalvar(Number(retirada), Number(entrega))) setEditando(false);
            }}
          />
        </div>
      ) : (
        <div className="stack stack--sm">
          <ListaDados
            itens={[
              ["Tempo de retirada", `${restaurante.tempoRetiradaMin} minutos`],
              ["Tempo de entrega", `${restaurante.tempoEntregaMin} minutos`],
            ]}
          />
          <div>
            <Button pequeno icone="relogio" onClick={abrir}>Alterar</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
