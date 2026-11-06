"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoSenha, TelaEntrada, TOKEN_DEMONSTRACAO } from "@/components/auth/PartesAuth";
import { Button, Field } from "@/components/ui";
import { setToken } from "@/lib/auth";
import { USE_MOCKS } from "@/lib/config";
import { useFormulario } from "@/lib/useFormulario";

export function CadastroView() {
  const router = useRouter();
  const { form, campo } = useFormulario({ nome: "", email: "", senha: "", confirmacao: "" });
  const [erro, setErro] = useState<string | null>(null);

  function cadastrar(e: FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }
    // O serviço de autenticação ainda não tem rota de cadastro: fora da demonstração, avisa em vez de fingir que criou a conta.
    if (!USE_MOCKS) {
      setErro("O cadastro ainda não está disponível. Fale com o suporte para criar a sua conta.");
      return;
    }
    setToken(TOKEN_DEMONSTRACAO);
    router.replace("/inicio");
  }

  return (
    <TelaEntrada
      titulo="Crie a sua conta"
      subtitulo="Preencha as informações abaixo para cadastrar o seu restaurante"
      avisoDemonstracao="Modo de demonstração: a conta não é criada de verdade."
      erro={erro}
      rodape={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="link-botao">
            Entrar
          </Link>
        </>
      }
    >
      <form className="login__form" onSubmit={cadastrar}>
        <Field rotulo="Restaurante" autoComplete="organization" placeholder="Nome do restaurante" required {...campo("nome")} />
        <Field rotulo="Usuário" type="email" autoComplete="email" placeholder="Email" required {...campo("email")} />
        <CampoSenha id="senha" rotulo="Senha" autoComplete="new-password" valor={form.senha} onChange={campo("senha").onChange} />
        <CampoSenha id="confirmacao" rotulo="Confirmar senha" autoComplete="new-password" valor={form.confirmacao} onChange={campo("confirmacao").onChange} />
        <Button type="submit" variante="marca" bloco>
          Cadastrar
        </Button>
      </form>
    </TelaEntrada>
  );
}
