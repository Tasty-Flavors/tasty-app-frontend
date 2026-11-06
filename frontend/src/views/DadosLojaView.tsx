"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { mascaraCep, mascaraCnpj, mascaraTelefone } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { obterDadosLoja, salvarDadosLoja } from "@/services/loja";
import type { DadosLoja, TipoChavePix } from "@/types";

const TIPOS_PIX: TipoChavePix[] = ["Email", "CPF", "CNPJ", "Telefone", "Aleatória"];

export function DadosLojaView() {
  const { data, setData, error, reload } = useAsync(obterDadosLoja);
  const { executar, ocupado, aviso } = useAcao();
  const [form, setForm] = useState<DadosLoja | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!data || !form) return <LoadState titulo="Dados da Loja" erro={error} onTentarNovamente={reload} />;

  const campo = (k: keyof DadosLoja, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const alterado = JSON.stringify(form) !== JSON.stringify(data);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const atual = form;
    const r = await executar(() => salvarDadosLoja(atual), "Dados da loja salvos");
    if (r) setData(r);
  }

  return (
    <form className="stack" onSubmit={salvar}>
      <PageHeader
        titulo="Dados da Loja"
        subtitulo="Endereço, dados bancários e contato usados nos repasses e no app."
        acoes={
          <>
            <Button disabled={!alterado} onClick={() => setForm(data)}>Descartar</Button>
            <Button type="submit" variante="primario" icone="check" disabled={!alterado || ocupado}>Salvar</Button>
          </>
        }
      />
      <Card titulo="Endereço">
        <div className="form-grid">
          <Field rotulo="Rua" required value={form.rua} onChange={(e) => campo("rua", e.target.value)} />
          <Field rotulo="Complemento" value={form.complemento} onChange={(e) => campo("complemento", e.target.value)} />
          <Field rotulo="Número" required value={form.numero} onChange={(e) => campo("numero", e.target.value)} />
          <Field rotulo="Cidade" required value={form.cidade} onChange={(e) => campo("cidade", e.target.value)} />
          <Field rotulo="Estado" required value={form.estado} onChange={(e) => campo("estado", e.target.value)} />
          <Field rotulo="CEP" required inputMode="numeric" value={form.cep} onChange={(e) => campo("cep", mascaraCep(e.target.value))} />
        </div>
      </Card>
      <Card titulo="Dados bancários">
        <div className="form-grid">
          <Field rotulo="Razão social" required value={form.razaoSocial} onChange={(e) => campo("razaoSocial", e.target.value)} />
          <Field rotulo="CNPJ" required inputMode="numeric" value={form.cnpj} onChange={(e) => campo("cnpj", mascaraCnpj(e.target.value))} />
          <Field rotulo="Chave PIX" required value={form.chavePix} onChange={(e) => campo("chavePix", e.target.value)} />
          <Field as="select" rotulo="Tipo da chave" value={form.tipoChavePix} onChange={(e) => campo("tipoChavePix", e.target.value)}>
            {TIPOS_PIX.map((t) => <option key={t}>{t}</option>)}
          </Field>
        </div>
      </Card>
      <Card titulo="Contato">
        <div className="form-grid">
          <Field rotulo="Telefone" required inputMode="tel" value={form.telefone} onChange={(e) => campo("telefone", mascaraTelefone(e.target.value))} />
          <Field rotulo="E-mail" required type="email" value={form.email} onChange={(e) => campo("email", e.target.value)} />
        </div>
      </Card>
      <Toast aviso={aviso} />
    </form>
  );
}
