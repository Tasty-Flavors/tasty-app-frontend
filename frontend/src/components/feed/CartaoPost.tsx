"use client";

import { BadgeStatus, Card, Icon, IconButton, type MapaStatus } from "@/components/ui";
import { formatarData, formatarNumero } from "@/lib/format";
import type { PostFeed } from "@/types";

const STATUS: MapaStatus<PostFeed["status"]> = {
  publicado: { rotulo: "Publicado", tom: "sucesso" },
  agendado: { rotulo: "Agendado", tom: "info" },
  rascunho: { rotulo: "Rascunho", tom: "neutro" },
};

export function CartaoPost({ post: p, onRemover }: { post: PostFeed; onRemover: () => void }) {
  return (
    <Card>
      <article className="post">
        <div className="post__midia" style={{ background: p.imagemCor }} aria-hidden="true" />
        <div className="post__corpo">
          <div className="row row--between">
            <div className="row">
              <BadgeStatus mapa={STATUS} valor={p.status} />
              <span className="t-small t-muted">{formatarData(p.data)}</span>
            </div>
            <IconButton icone="lixeira" rotulo="Remover post" onClick={onRemover} />
          </div>
          <p>{p.texto}</p>
          {p.status === "publicado" && (
            <div className="post__metricas">
              <span><Icon nome="coracao" tamanho={16} />{formatarNumero(p.curtidas)} curtidas</span>
              <span><Icon nome="mensagem" tamanho={16} />{formatarNumero(p.comentarios)} comentários</span>
              <span><Icon nome="olho" tamanho={16} />{formatarNumero(p.alcance)} de alcance</span>
            </div>
          )}
        </div>
      </article>
    </Card>
  );
}
