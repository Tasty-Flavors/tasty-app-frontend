import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Avaliacao, Desempenho, Fatura, Lancamento, Plano, PlanoId } from "@/types";
import { avaliacoesMock, desempenhoMock, distribuicaoNotasMock, faturasMock, lancamentosMock, planosMock } from "@/mocks/negocio";

let avaliacoes = structuredClone(avaliacoesMock);
let planoAtual: PlanoId = "pro";

/** TODO backend: GET /v1/restaurante/desempenho?periodo=7d */
export async function obterDesempenho(periodo: "7d" | "30d" | "90d" = "7d"): Promise<Desempenho> {
  if (USE_MOCKS) {
    const fator = periodo === "7d" ? 1 : periodo === "30d" ? 4.2 : 12.6;
    const d = structuredClone(desempenhoMock);
    d.faturamento *= fator;
    d.faturamentoAnterior *= fator;
    d.pedidos = Math.round(d.pedidos * fator);
    d.pedidosAnterior = Math.round(d.pedidosAnterior * fator);
    return mockResponse(d);
  }
  return api.get<Desempenho>(`/v1/restaurante/desempenho?periodo=${periodo}`);
}

export async function listarLancamentos(): Promise<Lancamento[]> {
  if (USE_MOCKS) return mockResponse(lancamentosMock);
  return api.get<Lancamento[]>("/v1/restaurante/financeiro/lancamentos");
}

export async function listarFaturas(): Promise<Fatura[]> {
  if (USE_MOCKS) return mockResponse(faturasMock);
  return api.get<Fatura[]>("/v1/restaurante/financeiro/faturas");
}

export async function listarAvaliacoes(): Promise<{ avaliacoes: Avaliacao[]; distribuicao: Record<number, number> }> {
  if (USE_MOCKS) return mockResponse({ avaliacoes, distribuicao: distribuicaoNotasMock });
  return api.get("/v1/restaurante/avaliacoes");
}

export async function responderAvaliacao(id: string, resposta: string) {
  if (USE_MOCKS) {
    avaliacoes = avaliacoes.map((a) => (a.id === id ? { ...a, resposta } : a));
    return mockResponse(avaliacoes);
  }
  return api.post<Avaliacao[]>(`/v1/restaurante/avaliacoes/${id}/resposta`, { resposta });
}

export async function listarPlanos(): Promise<{ planos: Plano[]; atual: PlanoId }> {
  if (USE_MOCKS) return mockResponse({ planos: planosMock, atual: planoAtual });
  return api.get("/v1/restaurante/planos");
}

export async function trocarPlano(id: PlanoId) {
  if (USE_MOCKS) {
    planoAtual = id;
    return mockResponse({ planos: planosMock, atual: planoAtual });
  }
  return api.post<{ planos: Plano[]; atual: PlanoId }>("/v1/restaurante/planos", { plano: id });
}
