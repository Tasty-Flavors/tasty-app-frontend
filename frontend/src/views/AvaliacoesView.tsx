"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pills } from "@/components/ui/Pills";
import { Stars } from "@/components/ui/Stars";
import { Toast } from "@/components/ui/Toast";
import { formatarData, formatarNumero } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarAvaliacoes, responderAvaliacao } from "@/services/negocio";
import type { Avaliacao } from "@/types";

type Filtro = "todas" | "sem_resposta" | "5" | "4" | "3" | "2" | "1";

function ItemAvaliacao({ avaliacao, ocupado, onResponder }: { avaliacao: Avaliacao; ocupado: boolean; onResponder: (texto: string) => Promise<boolean> }) {
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
            <div className="row">
              <Button pequeno onClick={() => setRespondendo(false)}>Cancelar</Button>
              <Button
                pequeno
                variante="primario"
                disabled={ocupado || !texto.trim()}
                onClick={async () => {
                  if (await onResponder(texto.trim())) setRespondendo(false);
                }}
              >
                Enviar resposta
              </Button>
            </div>
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

export function AvaliacoesView() {
  const { data, setData, error, reload } = useAsync(listarAvaliacoes);
  const { executar, ocupado, aviso } = useAcao();
  const [filtro, setFiltro] = useState<Filtro>("todas");

  if (!data) return <LoadState titulo="Avaliações" erro={error} onTentarNovamente={reload} />;
  const { avaliacoes, distribuicao } = data;

  const notas = [5, 4, 3, 2, 1];
  const total = notas.reduce((s, n) => s + (distribuicao[n] ?? 0), 0);
  const media = total ? notas.reduce((s, n) => s + n * (distribuicao[n] ?? 0), 0) / total : 0;
  const maximo = Math.max(1, ...notas.map((n) => distribuicao[n] ?? 0));
  const semResposta = avaliacoes.filter((a) => !a.resposta).length;
  const visiveis = avaliacoes.filter((a) => (filtro === "todas" ? true : filtro === "sem_resposta" ? !a.resposta : a.nota === Number(filtro)));

  async function responder(id: string, texto: string) {
    const r = await executar(() => responderAvaliacao(id, texto), "Resposta enviada");
    if (r) setData((d) => (d ? { ...d, avaliacoes: r } : d));
    return Boolean(r);
  }

  return (
    <div className="stack">
      <PageHeader titulo="Avaliações" subtitulo="Veja o que os clientes dizem e responda." />
      <div className="grid grid--sidebar">
        <Card titulo="Distribuição das notas">
          {notas.map((n) => (
            <div key={n} className="hbar hbar--notas">
              <span className="row row--compacta t-title">
                {n} <Icon nome="estrela-cheia" tamanho={14} />
              </span>
              <div className="progress" aria-hidden="true">
                <div className="progress__bar" style={{ width: `${((distribuicao[n] ?? 0) / maximo) * 100}%` }} />
              </div>
              <span className="t-num t-right">{formatarNumero(distribuicao[n] ?? 0)}</span>
            </div>
          ))}
        </Card>
        <Card titulo="Média geral">
          <div className="nota-geral">
            <span className="nota-geral__valor">{media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
            <Stars nota={media} />
            <span className="t-small t-muted">{formatarNumero(total)} avaliações</span>
          </div>
        </Card>
      </div>

      <Pills<Filtro>
        rotulo="Filtrar avaliações"
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: "todas", rotulo: "Todas" },
          { valor: "sem_resposta", rotulo: "Sem resposta", contagem: semResposta },
          ...notas.map((n) => ({ valor: String(n) as Filtro, rotulo: `${n} estrelas` })),
        ]}
      />

      <Card>
        {visiveis.length === 0 ? (
          <EmptyState icone="estrela" titulo="Nenhuma avaliação neste filtro" />
        ) : (
          visiveis.map((a) => <ItemAvaliacao key={a.id} avaliacao={a} ocupado={ocupado} onResponder={(t) => responder(a.id, t)} />)
        )}
      </Card>
      <Toast aviso={aviso} />
    </div>
  );
}
