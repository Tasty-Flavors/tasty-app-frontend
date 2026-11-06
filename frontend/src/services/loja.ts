import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Coordenada, DadosLoja, PreferenciasAcessibilidade, Restaurante, SessaoAtiva, UsuarioEquipe } from "@/types";
import { acessibilidadeMock, dadosLojaMock, equipeMock, restauranteMock, sessoesMock } from "@/mocks/loja";
import { localizarEndereco } from "@/mocks/rotas";

let restaurante = structuredClone(restauranteMock);
let dados = structuredClone(dadosLojaMock);
let sessoes = structuredClone(sessoesMock);
let equipe = structuredClone(equipeMock);
let doisFatores = false;

/** GET /v1/restaurante/dashboard — já existe no BFF. */
export async function obterRestaurante(): Promise<Restaurante> {
  if (USE_MOCKS) return mockResponse(restaurante);
  // O BFF ainda só devolve nome, imagem, endereço e descrição; o resto usa valores neutros.
  const r = await api.get<Partial<Restaurante> & Pick<Restaurante, "nomeEstabelecimento">>("/v1/restaurante/dashboard");
  return { endereco: "", descricao: "", notaMedia: 0, totalAvaliacoes: 0, tempoRetiradaMin: 0, tempoEntregaMin: 0, plano: "basico", ...r };
}

/**
 * Ponto do endereço cadastrado no mapa, ou `null` se não for possível localizá-lo.
 * TODO backend: GET /v1/restaurante/dashboard precisa devolver `localizacao { lat, lng }`.
 */
export async function obterLocalizacaoLoja(): Promise<Coordenada | null> {
  if (USE_MOCKS) return localizarEndereco(restaurante.endereco.replace(/\s*—\s*/g, ", "));
  return (await obterRestaurante()).localizacao ?? null;
}

/** PUT /v1/restaurante (multipart: descricao, logo) — já existe no BFF. */
export async function atualizarRestaurante(campos: { descricao: string; endereco: string; logo?: File }) {
  if (USE_MOCKS) {
    restaurante = { ...restaurante, descricao: campos.descricao, endereco: campos.endereco };
    if (campos.logo) restaurante.imagem = URL.createObjectURL(campos.logo);
    return mockResponse(restaurante);
  }
  const form = new FormData();
  form.append("descricao", campos.descricao);
  form.append("endereco", campos.endereco);
  if (campos.logo) form.append("logo", campos.logo);
  return api.put<Restaurante>("/v1/restaurante", form);
}

export async function atualizarTempos(tempoRetiradaMin: number, tempoEntregaMin: number) {
  if (USE_MOCKS) {
    restaurante = { ...restaurante, tempoRetiradaMin, tempoEntregaMin };
    return mockResponse(restaurante);
  }
  return api.patch<Restaurante>("/v1/restaurante/tempos", { tempoRetiradaMin, tempoEntregaMin });
}

/** TODO backend: GET /v1/restaurante/dados */
export async function obterDadosLoja(): Promise<DadosLoja> {
  if (USE_MOCKS) return mockResponse(dados);
  return api.get<DadosLoja>("/v1/restaurante/dados");
}

export async function salvarDadosLoja(novo: DadosLoja) {
  if (USE_MOCKS) {
    dados = structuredClone(novo);
    restaurante = { ...restaurante, endereco: `${novo.rua}, ${novo.numero} — ${novo.cidade}, ${novo.estado}` };
    return mockResponse(dados);
  }
  return api.put<DadosLoja>("/v1/restaurante/dados", novo as unknown as Record<string, unknown>);
}

const PREF_KEY = "tasty:acessibilidade";
/** Disparado ao salvar, para o restante do painel reagir na hora. */
export const EVENTO_PREFERENCIAS = "tasty:preferencias";

/** Preferências ficam no navegador; quando houver endpoint, sincronizar com o perfil. */
export function lerPreferencias(): PreferenciasAcessibilidade {
  if (typeof window === "undefined") return acessibilidadeMock;
  try {
    const salvo = window.localStorage.getItem(PREF_KEY);
    return salvo ? { ...acessibilidadeMock, ...JSON.parse(salvo) } : acessibilidadeMock;
  } catch {
    return acessibilidadeMock;
  }
}

export function salvarPreferencias(p: PreferenciasAcessibilidade) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    /* sem armazenamento: aplica só nesta sessão */
  }
  aplicarPreferencias(p);
  window.dispatchEvent(new Event(EVENTO_PREFERENCIAS));
}

export function aplicarPreferencias(p: PreferenciasAcessibilidade) {
  const root = document.documentElement;
  root.dataset.theme = p.modoEscuro ? "dark" : "light";
  root.dataset.vision = p.daltonismo ? "cvd" : "default";
  root.dataset.motion = p.animacoes ? "full" : "reduced";
}

/** TODO backend: GET /v1/restaurante/sessoes */
export async function listarSessoes(): Promise<SessaoAtiva[]> {
  if (USE_MOCKS) return mockResponse(sessoes);
  return api.get<SessaoAtiva[]>("/v1/restaurante/sessoes");
}

export async function encerrarSessao(id: string) {
  if (USE_MOCKS) {
    sessoes = sessoes.filter((s) => s.id !== id);
    return mockResponse(sessoes);
  }
  return api.delete<SessaoAtiva[]>(`/v1/restaurante/sessoes/${id}`);
}

export async function listarEquipe(): Promise<UsuarioEquipe[]> {
  if (USE_MOCKS) return mockResponse(equipe);
  return api.get<UsuarioEquipe[]>("/v1/restaurante/equipe");
}

export async function adicionarMembroEquipe(novo: Omit<UsuarioEquipe, "id">) {
  if (USE_MOCKS) {
    equipe = [...equipe, { ...novo, id: `u${Date.now()}` }];
    return mockResponse(equipe);
  }
  return api.post<UsuarioEquipe[]>("/v1/restaurante/equipe", novo);
}

export async function alterarPapelMembro(id: string, papel: UsuarioEquipe["papel"]) {
  if (USE_MOCKS) {
    equipe = equipe.map((u) => (u.id === id ? { ...u, papel } : u));
    return mockResponse(equipe);
  }
  return api.patch<UsuarioEquipe[]>(`/v1/restaurante/equipe/${id}`, { papel });
}

export async function removerMembroEquipe(id: string) {
  if (USE_MOCKS) {
    equipe = equipe.filter((u) => u.id !== id);
    return mockResponse(equipe);
  }
  return api.delete<UsuarioEquipe[]>(`/v1/restaurante/equipe/${id}`);
}

/* ---------- Segurança (TODO backend: nenhum destes endpoints existe ainda) ---------- */

export async function trocarSenha(senhaAtual: string, novaSenha: string) {
  if (USE_MOCKS) return mockResponse(true);
  return api.post<boolean>("/v1/restaurante/seguranca/senha", { senhaAtual, novaSenha });
}

export async function obterDoisFatores(): Promise<boolean> {
  if (USE_MOCKS) return mockResponse(doisFatores);
  return (await api.get<{ ativo: boolean }>("/v1/restaurante/seguranca/2fa")).ativo;
}

export async function definirDoisFatores(ativo: boolean) {
  if (USE_MOCKS) {
    doisFatores = ativo;
    return mockResponse(doisFatores);
  }
  await api.put("/v1/restaurante/seguranca/2fa", { ativo });
  return ativo;
}

export async function solicitarExportacaoDados() {
  if (USE_MOCKS) return mockResponse(true);
  return api.post<boolean>("/v1/restaurante/privacidade/exportacao");
}

export async function solicitarExclusaoDados() {
  if (USE_MOCKS) return mockResponse(true);
  return api.post<boolean>("/v1/restaurante/privacidade/exclusao");
}
