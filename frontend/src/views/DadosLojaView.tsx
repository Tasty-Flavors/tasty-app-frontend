"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, Field, LoadState, PageHeader, Toast } from "@/components/ui";
import { mascaraCep, mascaraCnpj, mascaraTelefone } from "@/lib/format";
import { TIPOS_PIX } from "@/lib/opcoes";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { obterDadosLoja, salvarDadosLoja } from "@/services/loja";
import type { DadosLoja } from "@/types";

export function DadosLojaView() {
  const { data, setData, error, reload } = useAsync(obterDadosLoja);
  const { executar, ocupado, aviso } = useAcao();
  const [form, setForm] = useState<DadosLoja | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!data || !form) return <LoadState titulo="Dados da Loja" erro={error} onTentarNovamente={reload} />;

  const campo = (k: keyof DadosLoja, mascara?: (v: string) => string) => ({
    value: form[k],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const valor = e.target.value;
      setForm((f) => (f ? { ...f, [k]: mascara ? mascara(valor) : valor } : f));
    },
  });
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
          <Field rotulo="Rua" required {...campo("rua")} />
          <Field rotulo="Complemento" {...campo("complemento")} />
          <Field rotulo="Número" required {...campo("numero")} />
          <Field rotulo="Cidade" required {...campo("cidade")} />
          <Field rotulo="Estado" required {...campo("estado")} />
          <Field rotulo="CEP" required inputMode="numeric" {...campo("cep", mascaraCep)} />
        </div>
      </Card>
      <Card titulo="Dados bancários">
        <div className="form-grid">
          <Field rotulo="Razão social" required {...campo("razaoSocial")} />
          <Field rotulo="CNPJ" required inputMode="numeric" {...campo("cnpj", mascaraCnpj)} />
          <Field rotulo="Chave PIX" required {...campo("chavePix")} />
          <Field as="select" rotulo="Tipo da chave" {...campo("tipoChavePix")}>
            {TIPOS_PIX.map((t) => <option key={t}>{t}</option>)}
          </Field>
        </div>
      </Card>
      <Card titulo="Contato">
        <div className="form-grid">
          <Field rotulo="Telefone" required inputMode="tel" {...campo("telefone", mascaraTelefone)} />
          <Field rotulo="E-mail" required type="email" {...campo("email")} />
        </div>
      </Card>
      <Toast aviso={aviso} />
    </form>
  );
}
