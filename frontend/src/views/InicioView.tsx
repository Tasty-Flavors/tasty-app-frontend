"use client";

import { useEffect, useState } from "react";
import { Resultado } from "@/components/inicio/Resultado";
import { CardLoja } from "@/components/inicio/CardLoja";
import { CardTempos } from "@/components/inicio/CardTempos";
import { CardFaturas } from "@/components/inicio/CardFaturas";
import { Badge, Button, ButtonLink, Card, EmptyState, LoadState, Notice, Pagina } from "@/components/ui";
import { abaixoDoMinimo, estaVencido, situacaoValidade, venceEmBreve } from "@/lib/estoque";
import { formatarMoeda, tempoDecorrido } from "@/lib/format";
import { resumoItens } from "@/lib/pedidos";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePreferencias } from "@/lib/usePreferencias";
import { atualizarRestaurante, atualizarTempos, obterRestaurante } from "@/services/loja";
import { listarFaturas, obterDesempenho } from "@/services/negocio";
import { listarEstoque, listarPedidos } from "@/services/operacao";
import type { ItemEstoque } from "@/types";

const INDISPONIVEL = "Dados indisponíveis no momento";

function descreverAlerta(item: ItemEstoque) {
  if (estaVencido(item) || venceEmBreve(item)) return { texto: situacaoValidade(item.validade).rotulo, tom: estaVencido(item) ? "perigo" : "alerta" } as const;
  return { texto: "Abaixo do mínimo", tom: "alerta" } as const;
}

export function InicioView() {
  const { data, setData, error, reload } = useAsync(async () => {
    // Só a loja é essencial: um atalho sem dados não pode derrubar a tela inteira.
    const [restaurante, pedidos, estoque, faturas, desempenho] = await Promise.all([
      obterRestaurante(),
      listarPedidos().catch(() => null),
      listarEstoque().catch(() => null),
      listarFaturas().catch(() => null),
      obterDesempenho("7d").catch(() => null),
    ]);
    return { restaurante, pedidos, estoque, faturas, desempenho };
  });
  const { executar, ocupado, aviso } = useAcao();
  const { prefs, atualizar } = usePreferencias();
  const [mostrarTutorial, setMostrarTutorial] = useState(false);

  useEffect(() => setMostrarTutorial(!prefs.tutorialVisto), [prefs.tutorialVisto]);

  if (!data) return <LoadState titulo="Início" erro={error} onTentarNovamente={reload} />;
  const { restaurante, pedidos, estoque, faturas, desempenho } = data;

  const novos = pedidos?.filter((p) => p.status === "novo") ?? [];
  const recusados = pedidos?.filter((p) => p.status === "recusado").length ?? 0;
  const concluidos = pedidos?.filter((p) => p.status === "concluido").length ?? 0;
  const aceitos = (pedidos?.length ?? 0) - novos.length - recusados;
  const alertas = (estoque ?? []).filter((i) => estaVencido(i) || venceEmBreve(i) || abaixoDoMinimo(i)).sort((a, b) => Number(estaVencido(b)) - Number(estaVencido(a)));

  async function salvarLoja(campos: { descricao: string; endereco: string; logo?: File }) {
    const r = await executar(() => atualizarRestaurante(campos), "Dados da loja atualizados");
    if (r) setData((d) => (d ? { ...d, restaurante: r } : d));
    return Boolean(r);
  }

  async function salvarTempos(retirada: number, entrega: number) {
    const r = await executar(() => atualizarTempos(retirada, entrega), "Tempos atualizados");
    if (r) setData((d) => (d ? { ...d, restaurante: r } : d));
    return Boolean(r);
  }

  return (
    <Pagina titulo="Início" subtitulo={`Bem-vindo novamente, ${restaurante.nomeEstabelecimento}!`} aviso={aviso}>

      {mostrarTutorial && (
        <Notice tom="info" icone="sino" titulo="Primeiros passos" acao={<Button pequeno onClick={() => atualizar({ tutorialVisto: true })}>Entendi</Button>}>
          Acompanhe os pedidos em Pedidos, os entregadores no mapa e a validade dos insumos em Estoque. Os ajustes de leitura e som ficam em Acessibilidade.
        </Notice>
      )}

      <CardLoja restaurante={restaurante} onSalvar={salvarLoja} ocupado={ocupado} />

      <div className="grid grid--2">
        <Card titulo="Pedidos novos" acao={<ButtonLink variante="fantasma" pequeno href="/pedidos">Abrir quadro</ButtonLink>}>
          {!pedidos ? (
            <EmptyState icone="alerta" titulo={INDISPONIVEL} />
          ) : novos.length === 0 ? (
            <EmptyState icone="check" titulo="Nenhum pedido aguardando" />
          ) : (
            <ul className="lista-simples">
              {novos.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <div className="min-0">
                    <div className="t-title">#{p.numero} · {p.cliente}</div>
                    <div className="t-small t-muted">{resumoItens(p)}</div>
                  </div>
                  <span className="t-small t-muted">{tempoDecorrido(p.criadoEm)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card titulo="Alertas de estoque" acao={<ButtonLink variante="fantasma" pequeno href="/estoque">Ver estoque</ButtonLink>}>
          {!estoque ? (
            <EmptyState icone="alerta" titulo={INDISPONIVEL} />
          ) : alertas.length === 0 ? (
            <EmptyState icone="check" titulo="Estoque em dia" />
          ) : (
            <ul className="lista-simples">
              {alertas.slice(0, 4).map((i) => {
                const a = descreverAlerta(i);
                return (
                  <li key={i.id}>
                    <span className="min-0">{i.nome}</span>
                    <Badge tom={a.tom} icone="alerta">{a.texto}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid--3">
        <CardTempos restaurante={restaurante} onSalvar={salvarTempos} ocupado={ocupado} />
        <Card titulo="Informes">
          <ul className="lista-simples">
            <li>
              <span>Dicas de Promoções</span>
              <ButtonLink pequeno href="/promocoes">Ler mais</ButtonLink>
            </li>
            <li>
              <span>Atendimento Financeiro</span>
              <ButtonLink pequeno href="/financeiro">Ler mais</ButtonLink>
            </li>
          </ul>
        </Card>
        {faturas ? (
          <CardFaturas faturas={faturas} />
        ) : (
          <Card titulo="Últimas faturas">
            <EmptyState icone="alerta" titulo={INDISPONIVEL} />
          </Card>
        )}
      </div>

      <div className="grid grid--2">
        <Card titulo="Pedidos" subtitulo="Hoje">
          <div className="resultados">
            <Resultado rotulo="Aceitos" classe="t-positive" valor={pedidos ? aceitos : "—"} />
            <Resultado rotulo="Recusados" classe="t-danger" valor={pedidos ? recusados : "—"} />
            <Resultado rotulo="Concluídos" classe="t-positive" valor={pedidos ? concluidos : "—"} />
          </div>
        </Card>
        <Card titulo="Faturamento" subtitulo="Últimos 7 dias">
          <span className="resultados__valor">{desempenho ? formatarMoeda(desempenho.faturamento) : "—"}</span>
        </Card>
      </div>
    </Pagina>
  );
}
