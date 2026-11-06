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
import { USE_MOCKS } from "@/lib/config";

const TOKEN_DEMONSTRACAO = "token-de-demonstracao";

export function CadastroView() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (getStoredToken()) router.replace("/inicio");
  }, [router]);

  function cadastrar(e: FormEvent) {
    e.preventDefault();
    if (senha !== confirmacao) {
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
    <main className="login">
      <div className="login__box">
        <div className="login__logo">
          <Image src="/assets/png/tasty-logo.png" alt="Logo Tasty Flavors Delivery" width={144} height={144} priority />
        </div>
        <h1 className="login__title">Crie a sua conta</h1>
        <p className="login__subtitulo">Preencha as informações abaixo para cadastrar o seu restaurante</p>

        {USE_MOCKS && (
          <div className="notice notice--info login__error">
            <Icon nome="alerta" />
            <span>Modo de demonstração: a conta não é criada de verdade.</span>
          </div>
        )}
        {erro && (
          <div className="notice notice--perigo login__error" role="alert">
            <Icon nome="alerta" />
            <span>{erro}</span>
          </div>
        )}

        <form className="login__form" onSubmit={cadastrar}>
          <Field rotulo="Restaurante" autoComplete="organization" placeholder="Nome do restaurante" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field rotulo="Usuário" type="email" autoComplete="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <CampoSenha id="senha" rotulo="Senha" autoComplete="new-password" valor={senha} onChange={(e) => setSenha(e.target.value)} />
          <CampoSenha id="confirmacao" rotulo="Confirmar senha" autoComplete="new-password" valor={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
          <Button type="submit" variante="marca" bloco>
            Cadastrar
          </Button>
        </form>

        <hr className="login__divider" />

        <BotoesSociais onClicar={() => setAviso("Esta opção ainda não está disponível. Use e-mail e senha.")} />
        {aviso && <p className="t-small login__aviso" role="status">{aviso}</p>}
        <p>
          Já tem uma conta?{" "}
          <Link href="/login" className="link-botao">
            Entrar
          </Link>
        </p>
        <VersaoApp />
      </div>
    </main>
  );
}
