"use client";

import { useState } from "react";
import { DrawerAcao, Field } from "@/components/ui";
import { mascaraCpf, mascaraTelefone } from "@/lib/format";
import { TIPOS_PIX } from "@/lib/opcoes";
import { useFormulario } from "@/lib/useFormulario";
import type { TipoChavePix, Veiculo } from "@/types";

const VEICULOS: Veiculo[] = ["Moto", "Carro", "Bike"];

export const FORM_VAZIO = { nome: "", cpf: "", telefone: "", veiculo: "Moto" as Veiculo, placa: "", chavePix: "", tipoChavePix: "Email" as TipoChavePix };

export function FormCadastro({ aberto, ocupado, onFechar, onSalvar }: { aberto: boolean; ocupado: boolean; onFechar: () => void; onSalvar: (f: typeof FORM_VAZIO) => void }) {
  const { form, setForm, campo } = useFormulario(FORM_VAZIO);
  const [tentou, setTentou] = useState(false);
  const erroDe = (chave: keyof typeof erros) => (tentou ? erros[chave] : undefined);
  const exigePlaca = form.veiculo !== "Bike";
  const erros = {
    nome: !form.nome.trim() ? "Informe o nome" : undefined,
    cpf: form.cpf.replace(/\D/g, "").length !== 11 ? "CPF deve ter 11 dígitos" : undefined,
    telefone: form.telefone.replace(/\D/g, "").length < 10 ? "Telefone incompleto" : undefined,
    placa: exigePlaca && !form.placa.trim() ? "Informe a placa" : undefined,
    chavePix: !form.chavePix.trim() ? "Informe a chave PIX" : undefined,
  };
  const valido = !Object.values(erros).some(Boolean);

  function salvar() {
    setTentou(true);
    if (!valido) return;
    onSalvar(form);
    setForm(FORM_VAZIO);
    setTentou(false);
  }

  return (
    <DrawerAcao aberto={aberto} titulo="Cadastrar entregador" rotuloConfirmar="Salvar" ocupado={ocupado} onCancelar={onFechar} onConfirmar={salvar}>
      <Field rotulo="Nome" erro={erroDe("nome")} {...campo("nome")} />
      <Field rotulo="CPF" inputMode="numeric" erro={erroDe("cpf")} {...campo("cpf", mascaraCpf)} />
      <Field rotulo="Telefone" inputMode="tel" erro={erroDe("telefone")} {...campo("telefone", mascaraTelefone)} />
      <Field as="select" rotulo="Veículo" {...campo("veiculo")}>
        {VEICULOS.map((v) => <option key={v}>{v}</option>)}
      </Field>
      {exigePlaca && <Field rotulo="Placa" erro={erroDe("placa")} {...campo("placa", (v) => v.toUpperCase())} />}
      <Field as="select" rotulo="Tipo da chave PIX" {...campo("tipoChavePix")}>
        {TIPOS_PIX.map((t) => <option key={t}>{t}</option>)}
      </Field>
      <Field rotulo="Chave PIX" erro={erroDe("chavePix")} {...campo("chavePix")} />
    </DrawerAcao>
  );
}
