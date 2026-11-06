"use client";

import { useState } from "react";
import { CartaoPost } from "@/components/feed/CartaoPost";
import { Button, Card, DrawerAcao, EmptyState, Field, LoadState, Pagina } from "@/components/ui";
import { dataLocalParaIso, dataParaInput } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { criarPost, listarPosts, removerPost } from "@/services/marketing";
import type { PostFeed } from "@/types";

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
    <Pagina titulo="Feed" subtitulo="Publique novidades para quem segue a sua loja." aviso={aviso}>
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
          <CartaoPost key={p.id} post={p} onRemover={() => setRemover(p)} />
        ))
      )}
      <DrawerAcao aberto={Boolean(remover)} titulo="Remover post" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>Este post sairá do feed da loja. Esta ação não pode ser desfeita.</p>
      </DrawerAcao>
    </Pagina>
  );
}
