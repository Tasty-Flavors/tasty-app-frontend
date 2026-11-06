import { AUTH_URL, USE_AUTH_MOCKS } from "@/lib/config";

export const TOKEN_DEMONSTRACAO = "token-de-demonstracao";

/** Mesma política de ValidaComplexidadeDaSenhaStep, no tasty-auth-service. */
const POLITICA_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*=).{8,}$/;
export const DICA_SENHA = "Mínimo de 8 caracteres, com maiúscula, minúscula, número e caractere especial (exceto =).";

export function senhaAtendePolitica(senha: string) {
  return POLITICA_SENHA.test(senha);
}

async function enviar(caminho: string, corpo: Record<string, string>) {
  try {
    return await fetch(`${AUTH_URL}${caminho}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }
}

/** POST /login — devolve o token de acesso. */
export async function autenticar(email: string, senha: string): Promise<string> {
  if (USE_AUTH_MOCKS) return TOKEN_DEMONSTRACAO;
  const resposta = await enviar("/login", { email, senha });
  if (resposta.status === 400 || resposta.status === 401 || resposta.status === 403) throw new Error("E-mail ou senha incorretos.");
  if (!resposta.ok) throw new Error("Não foi possível entrar agora. Tente novamente.");
  const dados = (await resposta.json()) as { accessToken?: string };
  if (!dados.accessToken) throw new Error("Não foi possível entrar agora. Tente novamente.");
  return dados.accessToken;
}

/** POST /v1/usuario/cadastrar — não devolve token: quem chama faz o login em seguida. */
export async function cadastrarUsuario(dados: { nomeEstabelecimento: string; email: string; senha: string }): Promise<void> {
  if (USE_AUTH_MOCKS) return;
  const resposta = await enviar("/v1/usuario/cadastrar", dados);
  if (resposta.ok) return;
  // 400 e 409 trazem uma mensagem feita para a pessoa; os demais, não.
  if (resposta.status === 400 || resposta.status === 409) {
    const corpo = (await resposta.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
    const mensagem = corpo?.errors?.[0]?.message;
    if (mensagem) throw new Error(mensagem);
  }
  throw new Error("Não foi possível criar a conta agora. Tente novamente.");
}
