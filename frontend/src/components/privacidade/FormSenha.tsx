"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field } from "@/components/ui";

const TAMANHO_MINIMO_SENHA = 8;

export function FormSenha({ onSalvar, ocupado }: { onSalvar: (atual: string, nova: string) => Promise<boolean>; ocupado: boolean }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const erroNova = nova && nova.length < TAMANHO_MINIMO_SENHA ? `Use ao menos ${TAMANHO_MINIMO_SENHA} caracteres` : undefined;
  const erroConfirmar = confirmar && confirmar !== nova ? "As senhas não conferem" : undefined;
  const valido = atual && nova.length >= TAMANHO_MINIMO_SENHA && confirmar === nova;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valido) return;
    if (await onSalvar(atual, nova)) {
      setAtual("");
      setNova("");
      setConfirmar("");
    }
  }

  return (
    <Card titulo="Trocar senha">
      <form className="form-edicao" onSubmit={enviar}>
        <Field rotulo="Senha atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
        <Field rotulo="Nova senha" type="password" autoComplete="new-password" erro={erroNova} value={nova} onChange={(e) => setNova(e.target.value)} />
        <Field rotulo="Confirmar nova senha" type="password" autoComplete="new-password" erro={erroConfirmar} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        <div>
          <Button type="submit" variante="primario" icone="chave" disabled={ocupado || !valido}>Trocar senha</Button>
        </div>
      </form>
    </Card>
  );
}
