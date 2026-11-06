"use client";

import { useState } from "react";
import { ItemAvaliacao } from "@/components/avaliacoes/ItemAvaliacao";
import { Card, EmptyState, Icon, LoadState, Pagina, Pills, Progresso, Stars } from "@/components/ui";
import { formatarNumero } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarAvaliacoes, responderAvaliacao } from "@/services/negocio";

type Filtro = "todas" | "sem_resposta" | "5" | "4" | "3" | "2" | "1";

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
    <Pagina titulo="Avaliações" subtitulo="Veja o que os clientes dizem e responda." aviso={aviso}>
      <div className="grid grid--sidebar">
        <Card titulo="Distribuição das notas">
          {notas.map((n) => (
            <div key={n} className="hbar hbar--notas">
              <span className="row row--compacta t-title">
                {n} <Icon nome="estrela-cheia" tamanho={14} />
              </span>
              <Progresso percentual={((distribuicao[n] ?? 0) / maximo) * 100} />
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
    </Pagina>
  );
}
