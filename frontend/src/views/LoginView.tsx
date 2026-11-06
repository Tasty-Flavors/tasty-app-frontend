"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoSenha, TelaEntrada } from "@/components/auth/PartesAuth";
import { Button, Field } from "@/components/ui";
import { setToken } from "@/lib/auth";
import { autenticar } from "@/services/auth";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      setToken(await autenticar(email, senha));
      router.replace("/inicio");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível entrar agora.");
      setEnviando(false);
    }
  }

  return (
    <TelaEntrada
      titulo="Bem-vindo de volta!"
      subtitulo="Preencha as informações abaixo para acessar sua conta"
      avisoDemonstracao="Modo de demonstração: qualquer e-mail e senha entram, sem servidor."
      erro={erro}
      rodape={
        <>
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="link-botao">
            Registrar-se
          </Link>
        </>
      }
    >
      <form className="login__form" onSubmit={entrar}>
        <Field rotulo="Usuário" type="email" autoComplete="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <CampoSenha id="senha" rotulo="Senha" autoComplete="current-password" valor={senha} onChange={(e) => setSenha(e.target.value)} />
        <Button type="submit" variante="marca" bloco disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </TelaEntrada>
  );
}
