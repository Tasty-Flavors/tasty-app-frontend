import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Anuncio, Cliente, Parceria, PostFeed, Promocao } from "@/types";
import { anunciosMock, clientesMock, parceriasMock, postsMock, promocoesMock } from "@/mocks/marketing";

/*
 * Nenhum destes endpoints existe ainda no BFF; os caminhos são uma proposta
 * e podem ser ajustados sem mexer nas telas.
 */

let clientes = structuredClone(clientesMock);
let promocoes = structuredClone(promocoesMock);
let anuncios = structuredClone(anunciosMock);
let posts = structuredClone(postsMock);
let parcerias = structuredClone(parceriasMock);

/* ---------- Clientes ---------- */

/** TODO backend: GET /v1/restaurante/clientes */
export async function listarClientes(): Promise<Cliente[]> {
  if (USE_MOCKS) return mockResponse(clientes);
  return api.get<Cliente[]>("/v1/restaurante/clientes");
}

export async function criarCliente(novo: Pick<Cliente, "nome" | "telefone" | "bairro">) {
  if (USE_MOCKS) {
    const c: Cliente = { ...novo, id: `c${Date.now()}`, pedidos: 0, totalGasto: 0, ultimoPedido: new Date().toISOString(), segmento: "Novo" };
    clientes = [c, ...clientes];
    return mockResponse(c);
  }
  return api.post<Cliente>("/v1/restaurante/clientes", novo);
}

/* ---------- Promoções ---------- */

/** TODO backend: GET /v1/restaurante/promocoes */
export async function listarPromocoes(): Promise<Promocao[]> {
  if (USE_MOCKS) return mockResponse(promocoes);
  return api.get<Promocao[]>("/v1/restaurante/promocoes");
}

export async function criarPromocao(nova: Pick<Promocao, "titulo" | "tipo" | "valor" | "aplicaEm" | "inicio" | "fim">) {
  if (USE_MOCKS) {
    const p: Promocao = {
      ...nova,
      id: `pm${Date.now()}`,
      status: new Date(nova.inicio).getTime() > Date.now() ? "agendada" : "ativa",
      usos: 0,
      receitaGerada: 0,
    };
    promocoes = [p, ...promocoes];
    return mockResponse(p);
  }
  return api.post<Promocao>("/v1/restaurante/promocoes", nova);
}

export async function encerrarPromocao(id: string) {
  if (USE_MOCKS) {
    promocoes = promocoes.map((p) => (p.id === id ? { ...p, status: "encerrada", fim: new Date().toISOString() } : p));
    return mockResponse(promocoes);
  }
  return api.post<Promocao[]>(`/v1/restaurante/promocoes/${id}/encerrar`);
}

/* ---------- Anúncios ---------- */

/** TODO backend: GET /v1/restaurante/anuncios */
export async function listarAnuncios(): Promise<Anuncio[]> {
  if (USE_MOCKS) return mockResponse(anuncios);
  return api.get<Anuncio[]>("/v1/restaurante/anuncios");
}

export async function criarAnuncio(novo: Pick<Anuncio, "titulo" | "formato" | "orcamentoDiario" | "inicio" | "fim">) {
  if (USE_MOCKS) {
    const a: Anuncio = { ...novo, id: `an${Date.now()}`, status: "ativo", gasto: 0, impressoes: 0, cliques: 0, pedidos: 0 };
    anuncios = [a, ...anuncios];
    return mockResponse(a);
  }
  return api.post<Anuncio>("/v1/restaurante/anuncios", novo);
}

export async function alterarStatusAnuncio(id: string, status: "ativo" | "pausado") {
  if (USE_MOCKS) {
    anuncios = anuncios.map((a) => (a.id === id ? { ...a, status } : a));
    return mockResponse(anuncios);
  }
  return api.patch<Anuncio[]>(`/v1/restaurante/anuncios/${id}`, { status });
}

/* ---------- Feed ---------- */

/** TODO backend: GET /v1/restaurante/feed */
export async function listarPosts(): Promise<PostFeed[]> {
  if (USE_MOCKS) return mockResponse(posts);
  return api.get<PostFeed[]>("/v1/restaurante/feed");
}

export async function criarPost(novo: Pick<PostFeed, "texto" | "data" | "imagemCor" | "status">) {
  if (USE_MOCKS) {
    const p: PostFeed = { ...novo, id: `f${Date.now()}`, curtidas: 0, comentarios: 0, alcance: 0 };
    posts = [p, ...posts];
    return mockResponse(p);
  }
  return api.post<PostFeed>("/v1/restaurante/feed", novo);
}

export async function removerPost(id: string) {
  if (USE_MOCKS) {
    posts = posts.filter((p) => p.id !== id);
    return mockResponse(posts);
  }
  return api.delete<PostFeed[]>(`/v1/restaurante/feed/${id}`);
}

/* ---------- Parcerias ---------- */

/** TODO backend: GET /v1/restaurante/parcerias */
export async function listarParcerias(): Promise<Parceria[]> {
  if (USE_MOCKS) return mockResponse(parcerias);
  return api.get<Parceria[]>("/v1/restaurante/parcerias");
}

export async function solicitarParceria(id: string) {
  if (USE_MOCKS) {
    parcerias = parcerias.map((p) => (p.id === id ? { ...p, status: "pendente" } : p));
    return mockResponse(parcerias);
  }
  return api.post<Parceria[]>(`/v1/restaurante/parcerias/${id}/solicitar`);
}

export async function indicarParceria(nova: Pick<Parceria, "nome" | "tipo" | "descricao" | "beneficio">) {
  if (USE_MOCKS) {
    const p: Parceria = { ...nova, id: `pa${Date.now()}`, status: "pendente" };
    parcerias = [p, ...parcerias];
    return mockResponse(p);
  }
  return api.post<Parceria>("/v1/restaurante/parcerias", nova);
}
