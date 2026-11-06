"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stars } from "@/components/ui/Stars";
import { Toast } from "@/components/ui/Toast";
import { abaixoDoMinimo, estaVencido, situacaoValidade, venceEmBreve } from "@/lib/estoque";
import { formatarData, formatarMoeda, tempoDecorrido } from "@/lib/format";
import { resumoItens } from "@/lib/pedidos";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePreferencias } from "@/lib/usePreferencias";
import { atualizarRestaurante, atualizarTempos, obterRestaurante } from "@/services/loja";
import { listarFaturas, obterDesempenho } from "@/services/negocio";
import { listarEstoque, listarPedidos } from "@/services/operacao";
import type { Fatura, ItemEstoque, Restaurante } from "@/types";

const INDISPONIVEL = "Dados indisponíveis no momento";
const TOM_FATURA = { paga: "sucesso", aberta: "alerta", atrasada: "perigo" } as const;
const ROTULO_FATURA = { paga: "Paga", aberta: "Aberta", atrasada: "Atrasada" } as const;

function descreverAlerta(item: ItemEstoque) {
  if (estaVencido(item) || venceEmBreve(item)) return { texto: situacaoValidade(item.validade).rotulo, tom: estaVencido(item) ? "perigo" : "alerta" } as const;
  return { texto: "Abaixo do mínimo", tom: "alerta" } as const;
}

function CardLoja({ restaurante, onSalvar, ocupado }: { restaurante: Restaurante; ocupado: boolean; onSalvar: (c: { descricao: string; endereco: string; logo?: File }) => Promise<boolean> }) {
  const [editando, setEditando] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [logo, setLogo] = useState<File>();

  function abrir() {
    setDescricao(restaurante.descricao);
    setEndereco(restaurante.endereco);
    setLogo(undefined);
    setEditando(true);
  }

  async function salvar() {
    if (await onSalvar({ descricao, endereco, logo })) setEditando(false);
  }

  return (
    <Card>
      <div className="loja-card">
        <div className="loja-card__info">
          <Avatar nome={restaurante.nomeEstabelecimento} src={restaurante.imagem} grande />
          <div className="loja-card__texto">
            <h2 className="card__title">{restaurante.nomeEstabelecimento}</h2>
            {editando ? (
              <div className="form-edicao">
                <Field rotulo="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                <Field as="textarea" rotulo="Descrição" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                <Field rotulo="Logo" type="file" accept="image/*" className="input-arquivo" onChange={(e) => setLogo(e.target.files?.[0])} />
                <div className="row">
                  <Button pequeno onClick={() => setEditando(false)}>Cancelar</Button>
                  <Button pequeno variante="primario" disabled={ocupado} onClick={salvar}>Salvar</Button>
                </div>
              </div>
            ) : (
              <>
                <p className="t-muted">{restaurante.endereco || "Sem endereço"}</p>
                <p>{restaurante.descricao || "Sem descrição"}</p>
                <Button pequeno icone="lapis" onClick={abrir}>Editar descrição e logo</Button>
              </>
            )}
          </div>
        </div>
        <Link href="/avaliacoes" className="nota-geral" aria-label="Ver avaliações">
          <span className="t-title t-small t-muted">Média geral</span>
          <span className="nota-geral__valor">{restaurante.notaMedia.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <Stars nota={restaurante.notaMedia} />
          <span className="t-small t-muted">{restaurante.totalAvaliacoes} avaliações</span>
        </Link>
      </div>
    </Card>
  );
}

function CardTempos({ restaurante, onSalvar, ocupado }: { restaurante: Restaurante; ocupado: boolean; onSalvar: (retirada: number, entrega: number) => Promise<boolean> }) {
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
          <div className="row">
            <Button pequeno onClick={() => setEditando(false)}>Cancelar</Button>
            <Button
              pequeno
              variante="primario"
              disabled={ocupado || !valido}
              onClick={async () => {
                if (await onSalvar(Number(retirada), Number(entrega))) setEditando(false);
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="stack stack--sm">
          <dl className="dl">
            <dt>Tempo de retirada</dt>
            <dd>{restaurante.tempoRetiradaMin} minutos</dd>
            <dt>Tempo de entrega</dt>
            <dd>{restaurante.tempoEntregaMin} minutos</dd>
          </dl>
          <div>
            <Button pequeno icone="relogio" onClick={abrir}>Alterar</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function CardFaturas({ faturas }: { faturas: Fatura[] }) {
  return (
    <Card titulo="Últimas faturas" acao={<ButtonLink variante="fantasma" pequeno href="/financeiro">Ver todas</ButtonLink>}>
      <ul className="lista-simples">
        {faturas.slice(0, 3).map((f) => (
          <li key={f.id}>
            <div className="min-0">
              <div>{f.competencia}</div>
              <div className="t-small t-muted">Vence em {formatarData(f.vencimento)}</div>
            </div>
            <Badge tom={TOM_FATURA[f.status]}>{ROTULO_FATURA[f.status]}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
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
    <div className="stack">
      <PageHeader titulo="Início" subtitulo={`Bem-vindo novamente, ${restaurante.nomeEstabelecimento}!`} />

      {mostrarTutorial && (
        <div className="notice notice--info">
          <Icon nome="sino" />
          <div className="stack stack--sm">
            <div>
              <p className="notice__title">Primeiros passos</p>
              <p>Acompanhe os pedidos em Pedidos, os entregadores no mapa e a validade dos insumos em Estoque. Os ajustes de leitura e som ficam em Acessibilidade.</p>
            </div>
            <div>
              <Button pequeno onClick={() => atualizar({ tutorialVisto: true })}>Entendi</Button>
            </div>
          </div>
        </div>
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
            <div>
              <span className="t-small">Aceitos</span>
              <span className="resultados__valor t-positive">{pedidos ? aceitos : "—"}</span>
            </div>
            <div>
              <span className="t-small">Recusados</span>
              <span className="resultados__valor t-danger">{pedidos ? recusados : "—"}</span>
            </div>
            <div>
              <span className="t-small">Concluídos</span>
              <span className="resultados__valor t-positive">{pedidos ? concluidos : "—"}</span>
            </div>
          </div>
        </Card>
        <Card titulo="Faturamento" subtitulo="Últimos 7 dias">
          <span className="resultados__valor">{desempenho ? formatarMoeda(desempenho.faturamento) : "—"}</span>
        </Card>
      </div>
      <Toast aviso={aviso} />
    </div>
  );
}

