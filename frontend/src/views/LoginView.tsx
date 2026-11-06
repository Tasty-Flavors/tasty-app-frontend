"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
        <p className="t-muted t-center">Preencha as informações abaixo para acessar sua conta</p>

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
          <div className="field">
            <label className="field__label" htmlFor="senha">
              Senha
            </label>
            <div className="login__password">
              <input
                id="senha"
                className="field__control"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button type="button" aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"} onClick={() => setMostrarSenha((m) => !m)}>
                <Icon nome={mostrarSenha ? "olho-fechado" : "olho"} />
              </button>
            </div>
          </div>
          <Button type="submit" variante="primario" bloco disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <hr className="login__divider" />

        <div className="login__social">
          <Button onClick={indisponivel}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.900h5.400a4.600 4.600 0 0 1-2 3v2.500h3.200c1.900-1.700 3-4.300 3-7.400ZM12 22c2.700 0 5-.9 6.600-2.400l-3.200-2.500c-.9.600-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22Zm-5.600-8a6 6 0 0 1 0-3.900V7.500H3.100a10 10 0 0 0 0 9l3.300-2.500ZM12 6c1.500 0 2.800.5 3.800 1.500l2.900-2.900A10 10 0 0 0 3.100 7.500l3.300 2.600C7.200 7.800 9.400 6 12 6Z" />
            </svg>
            Entrar com Google
          </Button>
          <Button onClick={indisponivel}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.710 19.500c-.830 1.240-1.710 2.450-3.050 2.470-1.340.030-1.770-.790-3.290-.790-1.530 0-2 .770-3.270.820-1.310.050-2.300-1.320-3.140-2.530C4.250 17 2.940 12.450 4.700 9.390c.870-1.520 2.430-2.480 4.120-2.510 1.280-.020 2.500.870 3.290.870.780 0 2.260-1.070 3.810-.910.650.030 2.470.260 3.640 1.980-.090.060-2.170 1.280-2.150 3.810.030 3.020 2.650 4.030 2.680 4.040-.030.070-.420 1.440-1.380 2.830ZM13 3.500c.730-.830 1.940-1.460 2.940-1.500.130 1.170-.340 2.350-1.040 3.190-.690.850-1.830 1.510-2.950 1.420-.150-1.150.410-2.350 1.050-3.110Z" />
            </svg>
            Entrar com Apple
          </Button>
        </div>
        {aviso && <p className="t-small t-muted" role="status">{aviso}</p>}
        <p>
          Não tem uma conta?{" "}
          <button type="button" className="link-botao" onClick={indisponivel}>
            Registrar-se
          </button>
        </p>
      </div>
    </main>
  );
}
