"use client";

import { useState } from "react";
import { AcoesEdicao, Avatar, Badge, Button, Field, Stars } from "@/components/ui";
import { formatarData } from "@/lib/format";
import type { Avaliacao } from "@/types";

export function ItemAvaliacao({ avaliacao, ocupado, onResponder }: { avaliacao: Avaliacao; ocupado: boolean; onResponder: (texto: string) => Promise<boolean> }) {
  const [respondendo, setRespondendo] = useState(false);
  const [texto, setTexto] = useState("");

  return (
    <article className="avaliacao">
      <Avatar nome={avaliacao.cliente} />
      <div className="avaliacao__corpo">
        <div className="row row--between">
          <div>
            <div className="t-title">{avaliacao.cliente}</div>
            <div className="t-small t-muted">Pedido #{avaliacao.pedidoNumero} · {formatarData(avaliacao.data)}</div>
          </div>
          <Stars nota={avaliacao.nota} pequeno />
        </div>
        <p>{avaliacao.comentario}</p>
        <div className="tag-lista">
          {avaliacao.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
        {avaliacao.resposta ? (
          <div className="avaliacao__resposta">
            <div className="t-small t-muted">Sua resposta</div>
            {avaliacao.resposta}
          </div>
        ) : respondendo ? (
          <div className="form-edicao">
            <Field as="textarea" rotulo="Resposta" rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
            <AcoesEdicao
              rotulo="Enviar resposta"
              desabilitado={ocupado || !texto.trim()}
              onCancelar={() => setRespondendo(false)}
              onSalvar={async () => {
                if (await onResponder(texto.trim())) setRespondendo(false);
              }}
            />
          </div>
        ) : (
          <div>
            <Button pequeno icone="mensagem" onClick={() => setRespondendo(true)}>Responder</Button>
          </div>
        )}
      </div>
    </article>
  );
}
