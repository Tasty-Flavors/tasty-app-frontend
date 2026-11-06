import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Avaliacao, Desempenho, Fatura, Lancamento, Plano, PlanoId } from "@/types";
import { avaliacoesMock, desempenhoMock, distribuicaoNotasMock, faturasMock, lancamentosMock, planosMock } from "@/mocks/negocio";

let avaliacoes = structuredClone(avaliacoesMock);
let planoAtual: PlanoId = "pro";

/** Repete o padrão semanal do mock com uma oscilação fixa, somando exatamente `total`. */
function serieDiariaSimulada(dias: number, total: number) {
  const semana = desempenhoMock.faturamentoPorDia.map((d) => d.valor);
  const brutos = Array.from({ length: dias }, (_, i) => semana[i % 7]! * (1 + Math.sin(i * 1.7) * 0.12));
  const escala = total / brutos.reduce((s, v) => s + v, 0);
  return brutos.map((v, i) => {
    const data = new Date(Date.now() - (dias - 1 - i) * 86400000);
    return { rotulo: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), valor: Math.round(v * escala * 100) / 100 };
  });
}

/** TODO backend: GET /v1/restaurante/desempenho?periodo=7d */
export async function obterDesempenho(periodo: "7d" | "30d" | "90d" = "7d"): Promise<Desempenho> {
  if (USE_MOCKS) {
    const fator = periodo === "7d" ? 1 : periodo === "30d" ? 4.2 : 12.6;
    const d = structuredClone(desempenhoMock);
    d.faturamento *= fator;
    d.faturamentoAnterior *= fator;
    d.pedidos = Math.round(d.pedidos * fator);
    d.pedidosAnterior = Math.round(d.pedidosAnterior * fator);
    if (periodo !== "7d") d.faturamentoPorDia = serieDiariaSimulada(periodo === "30d" ? 30 : 90, d.faturamento);
    d.pedidosPorHora = d.pedidosPorHora.map((h) => ({ ...h, valor: Math.round(h.valor * fator) }));
    d.maisVendidos = d.maisVendidos.map((m) => ({ ...m, quantidade: Math.round(m.quantidade * fator), receita: m.receita * fator }));
    d.canais = d.canais.map((c) => ({ ...c, pedidos: Math.round(c.pedidos * fator) }));
    return mockResponse(d);
  }
  return api.get<Desempenho>(`/v1/restaurante/desempenho?periodo=${periodo}`);
}

export async function listarLancamentos(): Promise<Lancamento[]> {
  if (USE_MOCKS) return mockResponse(lancamentosMock);
  return api.get<Lancamento[]>("/v1/restaurante/financeiro/lancamentos");
}

export interface ResumoFinanceiro {
  saldoAReceber: number;
  proximoRepasse: { data: string; valor: number };
  comissao: { percentual: number; valorPeriodo: number; plano: string };
}

/** TODO backend: GET /v1/restaurante/financeiro/resumo */
export async function obterResumoFinanceiro(): Promise<ResumoFinanceiro> {
  if (USE_MOCKS) {
    const aReceber = lancamentosMock.filter((l) => l.status !== "liquidado").reduce((s, l) => s + l.valor, 0);
    const ultimoRepasse = lancamentosMock.find((l) => l.tipo === "repasse");
    const base = ultimoRepasse ? new Date(ultimoRepasse.data).getTime() : Date.now();
    const plano = planosMock.find((p) => p.id === planoAtual)!;
    const comissoes = lancamentosMock.filter((l) => l.tipo === "taxa" && l.descricao.startsWith("Comissão"));
    return mockResponse({
      saldoAReceber: aReceber,
      proximoRepasse: { data: new Date(base + 7 * 86400000).toISOString(), valor: aReceber },
      comissao: { percentual: plano.comissao, valorPeriodo: Math.abs(comissoes.reduce((s, l) => s + l.valor, 0)), plano: plano.nome },
    });
  }
  return api.get<ResumoFinanceiro>("/v1/restaurante/financeiro/resumo");
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
