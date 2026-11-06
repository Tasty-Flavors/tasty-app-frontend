"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BotoesSociais, CampoSenha, VersaoApp } from "@/components/auth/PartesAuth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { getStoredToken, setToken } from "@/lib/auth";
import { AUTH_URL, USE_MOCKS } from "@/lib/config";

const TOKEN_DEMONSTRACAO = "token-de-demonstracao";

async function autenticar(email: string, senha: string) {
  if (USE_MOCKS) return TOKEN_DEMONSTRACAO;
  let resposta: Response;
  try {
    resposta = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }
  if (resposta.status === 400 || resposta.status === 401 || resposta.status === 403) throw new Error("E-mail ou senha incorretos.");
  if (!resposta.ok) throw new Error("Não foi possível entrar agora. Tente novamente.");
  const dados = (await resposta.json()) as { accessToken?: string };
  if (!dados.accessToken) throw new Error("Não foi possível entrar agora. Tente novamente.");
  return dados.accessToken;
}

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    // Só o login salvo redireciona: com token fixo, o logout levaria de volta ao painel.
    if (getStoredToken()) router.replace("/inicio");
  }, [router]);

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

  const indisponivel = () => setAviso("Esta opção ainda não está disponível. Use e-mail e senha.");

  return (
    <main className="login">
      <div className="login__box">
        <div className="login__logo">
          <Image src="/assets/png/tasty-logo.png" alt="Logo Tasty Flavors Delivery" width={144} height={144} priority />
        </div>
        <h1 className="login__title">Bem-vindo de volta!</h1>
        <p className="login__subtitulo">Preencha as informações abaixo para acessar sua conta</p>

        {USE_MOCKS && (
          <div className="notice notice--info login__error">
            <Icon nome="alerta" />
            <span>Modo de demonstração: qualquer e-mail e senha entram, sem servidor.</span>
          </div>
        )}
        {erro && (
          <div className="notice notice--perigo login__error" role="alert">
            <Icon nome="alerta" />
            <span>{erro}</span>
          </div>
        )}

        <form className="login__form" onSubmit={entrar}>
          <Field rotulo="Usuário" type="email" autoComplete="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <CampoSenha id="senha" rotulo="Senha" autoComplete="current-password" valor={senha} onChange={(e) => setSenha(e.target.value)} />
          <Button type="submit" variante="marca" bloco disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <hr className="login__divider" />

        <BotoesSociais onClicar={indisponivel} />
        {aviso && <p className="t-small login__aviso" role="status">{aviso}</p>}
        <p>
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="link-botao">
            Registrar-se
          </Link>
        </p>
        <VersaoApp />
      </div>
    </main>
  );
}
