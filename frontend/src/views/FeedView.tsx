"use client";

import { useState } from "react";
import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confirmacao } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { dataLocalParaIso, dataParaInput, formatarData, formatarNumero } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { criarPost, listarPosts, removerPost } from "@/services/marketing";
import type { PostFeed } from "@/types";

const STATUS: Record<PostFeed["status"], { rotulo: string; tom: TomBadge }> = {
  publicado: { rotulo: "Publicado", tom: "sucesso" },
  agendado: { rotulo: "Agendado", tom: "info" },
  rascunho: { rotulo: "Rascunho", tom: "neutro" },
};

const CORES = [
  { rotulo: "Laranja", valor: "var(--tasty-orange-400)" },
  { rotulo: "Marrom", valor: "var(--tasty-orange-700)" },
  { rotulo: "Roxo", valor: "var(--tasty-purple-700)" },
  { rotulo: "Verde", valor: "var(--tasty-green-500)" },
];

export function FeedView() {
  const { data, setData, error, reload } = useAsync(listarPosts);
  const { executar, ocupado, aviso } = useAcao();
  const [texto, setTexto] = useState("");
  const [cor, setCor] = useState(CORES[0]!.valor);
  const [agendarPara, setAgendarPara] = useState("");
  const [remover, setRemover] = useState<PostFeed | null>(null);

  if (!data) return <LoadState titulo="Feed" erro={error} onTentarNovamente={reload} />;

  async function criar(status: PostFeed["status"]) {
    const agendado = status === "agendado";
    const novo = await executar(
      () => criarPost({ texto: texto.trim(), imagemCor: cor, status, data: agendado ? dataLocalParaIso(agendarPara) : new Date().toISOString() }),
      status === "publicado" ? "Post publicado" : agendado ? "Post agendado" : "Rascunho salvo",
    );
    if (!novo) return;
    setData((d) => (d ? [novo, ...d] : d));
    setTexto("");
    setAgendarPara("");
  }

  async function confirmarRemocao() {
    if (!remover) return;
    const r = await executar(() => removerPost(remover.id), "Post removido");
    if (r) setData(r);
    setRemover(null);
  }

  const vazio = !texto.trim();

  return (
    <div className="stack">
      <PageHeader titulo="Feed" subtitulo="Publique novidades para quem segue a sua loja." />
      <Card titulo="Novo post">
        <div className="form-edicao">
          <Field as="textarea" rotulo="Texto" rows={3} placeholder="Conte uma novidade da loja" value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="form-grid">
            <div className="field">
              <span className="field__label">Cor da arte</span>
              <div className="amostras" role="group" aria-label="Cor da arte">
                {CORES.map((c) => (
                  <button key={c.valor} type="button" className="amostra" style={{ background: c.valor }} aria-pressed={cor === c.valor} aria-label={c.rotulo} title={c.rotulo} onClick={() => setCor(c.valor)} />
                ))}
              </div>
            </div>
            <Field rotulo="Agendar para (opcional)" type="date" min={dataParaInput(1)} value={agendarPara} onChange={(e) => setAgendarPara(e.target.value)} />
          </div>
          <div className="row">
            {agendarPara ? (
              <Button variante="primario" icone="calendario" disabled={vazio || ocupado} onClick={() => criar("agendado")}>Agendar</Button>
            ) : (
              <Button variante="primario" icone="navegar" disabled={vazio || ocupado} onClick={() => criar("publicado")}>Publicar</Button>
            )}
            <Button disabled={vazio || ocupado} onClick={() => criar("rascunho")}>Salvar rascunho</Button>
          </div>
        </div>
      </Card>

      {data.length === 0 ? (
        <EmptyState icone="mensagem" titulo="Nenhum post ainda" />
      ) : (
        data.map((p) => (
          <Card key={p.id}>
            <article className="post">
              <div className="post__midia" style={{ background: p.imagemCor }} aria-hidden="true" />
              <div className="post__corpo">
                <div className="row row--between">
                  <div className="row">
                    <Badge tom={STATUS[p.status].tom}>{STATUS[p.status].rotulo}</Badge>
                    <span className="t-small t-muted">{formatarData(p.data)}</span>
                  </div>
                  <IconButton icone="lixeira" rotulo="Remover post" onClick={() => setRemover(p)} />
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
        ))
      )}
      <Confirmacao aberto={Boolean(remover)} titulo="Remover post" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>Este post sairá do feed da loja. Esta ação não pode ser desfeita.</p>
      </Confirmacao>
      <Toast aviso={aviso} />
    </div>
  );
}
