"use client";

import { useState } from "react";
import { BadgeStatus, Button, Card, CelulaTitulo, DrawerAcao, EmptyState, Field, LoadState, type MapaStatus, Pagina, Pills, Tabela } from "@/components/ui";
import { dataLocalParaIso, dataParaInput, formatarData, formatarMoeda, formatarNumero } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { useFormulario } from "@/lib/useFormulario";
import { criarPromocao, encerrarPromocao, listarPromocoes } from "@/services/marketing";
import type { Promocao } from "@/types";

type Filtro = "todas" | Promocao["status"];

const STATUS: MapaStatus<Promocao["status"]> = {
  ativa: { rotulo: "Ativa", tom: "sucesso" },
  agendada: { rotulo: "Agendada", tom: "info" },
  encerrada: { rotulo: "Encerrada", tom: "neutro" },
};

const TIPOS: Record<Promocao["tipo"], string> = { percentual: "Desconto em %", valor: "Desconto em R$", frete_gratis: "Frete grátis", combo: "Combo" };

function descreverBeneficio(p: Promocao) {
  switch (p.tipo) {
    case "percentual": return `${p.valor}% de desconto`;
    case "valor": return `${formatarMoeda(p.valor)} de desconto`;
    case "frete_gratis": return "Frete grátis";
    case "combo": return `Combo por ${formatarMoeda(p.valor)}`;
  }
}

const formVazio = () => ({ titulo: "", tipo: "percentual" as Promocao["tipo"], valor: "", aplicaEm: "", inicio: dataParaInput(), fim: dataParaInput(7) });

export function PromocoesView() {
  const { data, setData, error, reload } = useAsync(listarPromocoes);
  const { executar, ocupado, aviso } = useAcao();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [criando, setCriando] = useState(false);
  const { form, setForm, campo } = useFormulario(formVazio);

  if (!data) return <LoadState titulo="Promoções" erro={error} onTentarNovamente={reload} />;

  const visiveis = data.filter((p) => filtro === "todas" || p.status === filtro);
  const semValor = form.tipo === "frete_gratis";
  const erroDatas = form.fim < form.inicio ? "O fim deve ser depois do início" : undefined;
  const valido = form.titulo.trim() && form.aplicaEm.trim() && (semValor || Number(form.valor) > 0) && !erroDatas;

  async function salvar() {
    const nova = await executar(
      () =>
        criarPromocao({
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          valor: semValor ? 0 : Number(form.valor),
          aplicaEm: form.aplicaEm.trim(),
          inicio: dataLocalParaIso(form.inicio),
          fim: dataLocalParaIso(form.fim),
        }),
      "Promoção criada",
    );
    if (!nova) return;
    setData((d) => (d ? [nova, ...d] : d));
    setForm(formVazio());
    setCriando(false);
  }

  async function encerrar(id: string) {
    const r = await executar(() => encerrarPromocao(id), "Promoção encerrada");
    if (r) setData(r);
  }

  return (
    <Pagina titulo="Promoções" subtitulo="Crie ofertas e acompanhe o resultado." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Nova promoção</Button>} aviso={aviso}>
      <Pills<Filtro>
        rotulo="Situação"
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: "todas", rotulo: "Todas" },
          { valor: "ativa", rotulo: "Ativas" },
          { valor: "agendada", rotulo: "Agendadas" },
          { valor: "encerrada", rotulo: "Encerradas" },
        ]}
      />
      <Card semPadding>
        <Tabela
          itens={visiveis}
          vazio={<EmptyState icone="porcentagem" titulo="Nenhuma promoção neste filtro" />}
          colunas={[
            { titulo: "Promoção", celula: (p) => <CelulaTitulo titulo={p.titulo} apoio={descreverBeneficio(p)} /> },
            { titulo: "Vale para", celula: (p) => p.aplicaEm },
            { titulo: "Período", classe: "t-small", celula: (p) => <>{formatarData(p.inicio)} a {formatarData(p.fim)}</> },
            { titulo: "Situação", celula: (p) => <BadgeStatus mapa={STATUS} valor={p.status} /> },
            { titulo: "Usos", num: true, celula: (p) => formatarNumero(p.usos) },
            { titulo: "Receita", num: true, celula: (p) => formatarMoeda(p.receitaGerada) },
            { titulo: "Ações", oculto: true, celula: (p) => p.status !== "encerrada" && <Button pequeno disabled={ocupado} onClick={() => encerrar(p.id)}>Encerrar</Button> },
          ]}
        />
      </Card>
      <DrawerAcao aberto={criando} titulo="Nova promoção" rotuloConfirmar="Criar promoção" ocupado={ocupado} confirmarDesabilitado={!valido} onCancelar={() => setCriando(false)} onConfirmar={salvar}>
        <Field rotulo="Título" {...campo("titulo")} />
        <Field as="select" rotulo="Tipo" {...campo("tipo")}>
          {Object.entries(TIPOS).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </Field>
        {!semValor && (
          <Field rotulo={form.tipo === "percentual" ? "Desconto (%)" : form.tipo === "combo" ? "Preço do combo (R$)" : "Desconto (R$)"} type="number" min={0} step="0.5" {...campo("valor")} />
        )}
        <Field rotulo="Vale para" placeholder="Ex.: Sobremesas" {...campo("aplicaEm")} />
        <Field rotulo="Início" type="date" {...campo("inicio")} />
        <Field rotulo="Fim" type="date" erro={erroDatas} {...campo("fim")} />
      </DrawerAcao>
    </Pagina>
  );
}
