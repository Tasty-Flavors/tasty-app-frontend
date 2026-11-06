"use client";

import Image from "next/image";
import { Badge, BadgeStatus, Button, Icon, IconButton, type MapaStatus } from "@/components/ui";
import { formatarMoeda } from "@/lib/format";
import type { Produto, StatusProduto } from "@/types";

const STATUS: MapaStatus<StatusProduto> = {
  aprovado: { rotulo: "Aprovado", tom: "sucesso" },
  processando: { rotulo: "Processando", tom: "alerta" },
  editando: { rotulo: "Em edição", tom: "info" },
  pausado: { rotulo: "Pausado", tom: "neutro" },
};

export function CartaoProduto({ produto: p, ocupado, onEditar, onRemover, onAlternarPausa }: { produto: Produto; ocupado: boolean; onEditar: () => void; onRemover: () => void; onAlternarPausa: () => void }) {
  return (
    <article className="produto">
      <div className="produto__imagem">
        {p.imagem ? <Image src={p.imagem} alt={p.nome} width={96} height={96} unoptimized /> : <Icon nome="imagem" />}
      </div>
      <div className="produto__corpo">
        <h3 className="kpi__label">{p.nome}</h3>
        <p className="t-small t-muted">{p.descricao}</p>
        <span className="t-num">{formatarMoeda(p.preco)}</span>
        <div className="tag-lista">
          <BadgeStatus mapa={STATUS} valor={p.status} />
          <Badge>{p.categoria}</Badge>
        </div>
      </div>
      <div className="produto__acoes">
        <div className="row row--compacta">
          <IconButton icone="lapis" rotulo={`Editar ${p.nome}`} onClick={onEditar} />
          <IconButton icone="lixeira" rotulo={`Remover ${p.nome}`} onClick={onRemover} />
        </div>
        <Button pequeno disabled={ocupado} onClick={onAlternarPausa}>{p.ativo ? "Pausar" : "Reativar"}</Button>
      </div>
    </article>
  );
}
