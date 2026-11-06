"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoSenha, TelaEntrada } from "@/components/auth/PartesAuth";
import { Button, Field } from "@/components/ui";
import { setToken } from "@/lib/auth";
import { useFormulario } from "@/lib/useFormulario";
import { autenticar, cadastrarUsuario, DICA_SENHA, senhaAtendePolitica } from "@/services/auth";

export function CadastroView() {
  const router = useRouter();
  const { form, campo } = useFormulario({ nome: "", email: "", senha: "", confirmacao: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(e: FormEvent) {
    e.preventDefault();
    if (!senhaAtendePolitica(form.senha)) {
      setErro(`Senha fraca. ${DICA_SENHA}`);
      return;
    }
    if (form.senha !== form.confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }
    setErro(null);
    setEnviando(true);
    const email = form.email.trim();
    try {
      await cadastrarUsuario({ nomeEstabelecimento: form.nome.trim(), email, senha: form.senha });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível criar a conta agora.");
      setEnviando(false);
      return;
    }
    // A rota de cadastro não devolve token: entra com os dados que acabaram de ser criados.
    try {
      setToken(await autenticar(email, form.senha));
      router.replace("/inicio");
    } catch {
      setErro("Sua conta foi criada, mas não foi possível entrar agora. Tente pela tela de login.");
      setEnviando(false);
    }
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
        <p className="t-small">{DICA_SENHA}</p>
        <Button type="submit" variante="marca" bloco disabled={enviando}>
          {enviando ? "Cadastrando…" : "Cadastrar"}
        </Button>
      </form>
    </TelaEntrada>
  );
}
