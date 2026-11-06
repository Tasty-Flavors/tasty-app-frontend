"use client";

import { useState } from "react";
import { BadgeStatus, Button, Card, CelulaTitulo, DrawerAcao, EmptyState, Field, KpiCard, LoadState, type MapaStatus, Pagina, Tabela } from "@/components/ui";
import { dataLocalParaIso, dataParaInput, formatarData, formatarMoeda, formatarNumero, formatarPercentual } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { useFormulario } from "@/lib/useFormulario";
import { alterarStatusAnuncio, criarAnuncio, listarAnuncios } from "@/services/marketing";
import type { Anuncio } from "@/types";

const STATUS: MapaStatus<Anuncio["status"]> = {
  ativo: { rotulo: "Ativo", tom: "sucesso" },
  pausado: { rotulo: "Pausado", tom: "alerta" },
  encerrado: { rotulo: "Encerrado", tom: "neutro" },
};
const FORMATOS: Anuncio["formato"][] = ["Destaque na busca", "Banner na home", "Vitrine de categoria"];

const formVazio = () => ({ titulo: "", formato: FORMATOS[0]!, orcamentoDiario: "", inicio: dataParaInput(), fim: dataParaInput(30) });

export function AnunciosView() {
  const { data, setData, error, reload } = useAsync(listarAnuncios);
  const { executar, ocupado, aviso } = useAcao();
  const [criando, setCriando] = useState(false);
  const { form, setForm, campo } = useFormulario(formVazio);

  if (!data) return <LoadState titulo="Anúncios" erro={error} onTentarNovamente={reload} />;

  const gasto = data.reduce((s, a) => s + a.gasto, 0);
  const pedidos = data.reduce((s, a) => s + a.pedidos, 0);
  const impressoes = data.reduce((s, a) => s + a.impressoes, 0);
  const cliques = data.reduce((s, a) => s + a.cliques, 0);
  const erroDatas = form.fim < form.inicio ? "O fim deve ser depois do início" : undefined;
  const valido = form.titulo.trim() && Number(form.orcamentoDiario) > 0 && !erroDatas;

  async function salvar() {
    const novo = await executar(
      () =>
        criarAnuncio({
          titulo: form.titulo.trim(),
          formato: form.formato,
          orcamentoDiario: Number(form.orcamentoDiario),
          inicio: dataLocalParaIso(form.inicio),
          fim: dataLocalParaIso(form.fim),
        }),
      "Anúncio criado",
    );
    if (!novo) return;
    setData((d) => (d ? [novo, ...d] : d));
    setForm(formVazio());
    setCriando(false);
  }

  async function alternar(a: Anuncio) {
    const r = await executar(() => alterarStatusAnuncio(a.id, a.status === "ativo" ? "pausado" : "ativo"), a.status === "ativo" ? "Anúncio pausado" : "Anúncio retomado");
    if (r) setData(r);
  }

  return (
    <Pagina titulo="Anúncios" subtitulo="Ganhe visibilidade dentro do app Tasty." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Novo anúncio</Button>} aviso={aviso}>
      <div className="grid grid--4">
        <KpiCard rotulo="Investido" valor={formatarMoeda(gasto)} />
        <KpiCard rotulo="Impressões" valor={formatarNumero(impressoes)} />
        <KpiCard rotulo="Taxa de clique" valor={formatarPercentual(impressoes ? cliques / impressoes : 0)} detalhe={`${formatarNumero(cliques)} cliques`} />
        <KpiCard rotulo="Pedidos gerados" valor={formatarNumero(pedidos)} detalhe={pedidos ? `${formatarMoeda(gasto / pedidos)} por pedido` : undefined} />
      </div>
      <Card semPadding>
        <Tabela
          itens={data}
          vazio={<EmptyState titulo="Nenhum anúncio criado" />}
          colunas={[
            { titulo: "Anúncio", celula: (a) => <CelulaTitulo titulo={a.titulo} apoio={a.formato} /> },
            { titulo: "Período", classe: "t-small", celula: (a) => <>{formatarData(a.inicio)} a {formatarData(a.fim)}</> },
            { titulo: "Situação", celula: (a) => <BadgeStatus mapa={STATUS} valor={a.status} /> },
            { titulo: "Orçamento/dia", num: true, celula: (a) => formatarMoeda(a.orcamentoDiario) },
            { titulo: "Gasto", num: true, celula: (a) => formatarMoeda(a.gasto) },
            { titulo: "Cliques", num: true, celula: (a) => formatarNumero(a.cliques) },
            { titulo: "Pedidos", num: true, celula: (a) => formatarNumero(a.pedidos) },
            { titulo: "Ações", oculto: true, celula: (a) => a.status !== "encerrado" && <Button pequeno disabled={ocupado} onClick={() => alternar(a)}>{a.status === "ativo" ? "Pausar" : "Retomar"}</Button> },
          ]}
        />
      </Card>
      <DrawerAcao aberto={criando} titulo="Novo anúncio" rotuloConfirmar="Criar anúncio" ocupado={ocupado} confirmarDesabilitado={!valido} onCancelar={() => setCriando(false)} onConfirmar={salvar}>
        <Field rotulo="Título" {...campo("titulo")} />
        <Field as="select" rotulo="Formato" {...campo("formato")}>
          {FORMATOS.map((f) => <option key={f}>{f}</option>)}
        </Field>
        <Field rotulo="Orçamento diário (R$)" type="number" min={0} step="1" {...campo("orcamentoDiario")} />
        <Field rotulo="Início" type="date" {...campo("inicio")} />
        <Field rotulo="Fim" type="date" erro={erroDatas} {...campo("fim")} />
      </DrawerAcao>
    </Pagina>
  );
}
