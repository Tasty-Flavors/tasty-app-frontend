"use client";

import { useState } from "react";
import { CartaoParceria } from "@/components/parcerias/CartaoParceria";
import { Button, DrawerAcao, EmptyState, Field, LoadState, Pagina } from "@/components/ui";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { useFormulario } from "@/lib/useFormulario";
import { indicarParceria, listarParcerias, solicitarParceria } from "@/services/marketing";
import type { Parceria } from "@/types";

const TIPOS: Parceria["tipo"][] = ["Fornecedor", "Bebidas", "Embalagens", "Benefícios", "Pagamentos"];
const FORM_VAZIO = { nome: "", tipo: TIPOS[0]!, descricao: "", beneficio: "" };

export function ParceriasView() {
  const { data, setData, error, reload } = useAsync(listarParcerias);
  const { executar, ocupado, aviso } = useAcao();
  const [criando, setCriando] = useState(false);
  const { form, setForm, campo } = useFormulario(FORM_VAZIO);

  if (!data) return <LoadState titulo="Parcerias" erro={error} onTentarNovamente={reload} />;

  async function solicitar(id: string) {
    const r = await executar(() => solicitarParceria(id), "Solicitação enviada");
    if (r) setData(r);
  }

  async function salvar() {
    const nova = await executar(() => indicarParceria({ ...form, nome: form.nome.trim() }), "Indicação enviada para análise");
    if (!nova) return;
    setData((d) => (d ? [nova, ...d] : d));
    setForm(FORM_VAZIO);
    setCriando(false);
  }

  return (
    <Pagina titulo="Parcerias" subtitulo="Benefícios com fornecedores e serviços para a sua loja." acoes={<Button variante="primario" icone="mais" onClick={() => setCriando(true)}>Indicar parceiro</Button>} aviso={aviso}>
      {data.length === 0 ? (
        <EmptyState titulo="Nenhuma parceria disponível" />
      ) : (
        <div className="grid grid--3">
          {data.map((p) => (
            <CartaoParceria key={p.id} parceria={p} ocupado={ocupado} onSolicitar={() => solicitar(p.id)} />
          ))}
        </div>
      )}
      <DrawerAcao aberto={criando} titulo="Indicar parceiro" rotuloConfirmar="Enviar indicação" ocupado={ocupado} confirmarDesabilitado={!form.nome.trim() || !form.descricao.trim()} onCancelar={() => setCriando(false)} onConfirmar={salvar}>
        <Field rotulo="Nome do parceiro" {...campo("nome")} />
        <Field as="select" rotulo="Tipo" {...campo("tipo")}>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </Field>
        <Field as="textarea" rotulo="Descrição" rows={3} {...campo("descricao")} />
        <Field rotulo="Benefício esperado" {...campo("beneficio")} />
      </DrawerAcao>
    </Pagina>
  );
}
