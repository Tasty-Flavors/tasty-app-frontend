import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Entregador, ItemEstoque, MovimentoEstoque, Pedido, Produto, StatusPedido } from "@/types";
import { entregadoresMock, estoqueMock, movimentosEstoqueMock, pedidosMock, posicaoLojaMock, produtosMock } from "@/mocks/operacao";

/*
 * Endpoints marcados com TODO ainda não existem no BFF; os caminhos são uma
 * proposta e podem ser ajustados sem mexer nas telas.
 */

let pedidos = structuredClone(pedidosMock);
let entregadores = structuredClone(entregadoresMock);
let estoque = structuredClone(estoqueMock);
let movimentos = structuredClone(movimentosEstoqueMock);
let produtos = structuredClone(produtosMock);

/* ---------- Pedidos ---------- */

const INTERVALO_PEDIDO_SIMULADO_MS = 90_000;
const MAX_PEDIDOS_NOVOS_SIMULADOS = 5;
let ultimoPedidoSimulado = Date.now();

/** Só no modo mock: um pedido chega de tempos em tempos, para exercitar o quadro e o alerta sonoro. */
function simularPedidoNovo() {
  const novos = pedidos.filter((p) => p.status === "novo").length;
  if (Date.now() - ultimoPedidoSimulado < INTERVALO_PEDIDO_SIMULADO_MS || novos >= MAX_PEDIDOS_NOVOS_SIMULADOS) return;
  ultimoPedidoSimulado = Date.now();
  const numero = Math.max(...pedidos.map((p) => p.numero)) + 1;
  pedidos = [
    {
      id: `p${Date.now()}`, numero, cliente: "Mariana Silva", telefone: "(51) 99777-3434", status: "novo", tipo: "entrega",
      pagamento: "PIX", criadoEm: new Date().toISOString(), endereco: "Rua Sarmento Leite, 320 — Farroupilha", taxaEntrega: 6,
      itens: [{ nome: "X-Salada", quantidade: 1, precoUnitario: 26 }, { nome: "Suco de laranja", quantidade: 1, precoUnitario: 9 }],
      total: 41,
    },
    ...pedidos,
  ];
}

/** TODO backend: GET /v1/restaurante/pedidos */
export async function listarPedidos(): Promise<Pedido[]> {
  if (USE_MOCKS) {
    simularPedidoNovo();
    return mockResponse(pedidos);
  }
  return api.get<Pedido[]>("/v1/restaurante/pedidos");
}

export async function atualizarStatusPedido(id: string, status: StatusPedido, extra?: Partial<Pedido>) {
  if (USE_MOCKS) {
    pedidos = pedidos.map((p) => (p.id === id ? { ...p, ...extra, status } : p));
    if (status === "concluido") {
      entregadores = entregadores.map((e) =>
        e.pedidoId === id ? { ...e, status: "disponivel", pedidoId: undefined, destino: undefined, entregasHoje: e.entregasHoje + 1 } : e,
      );
    }
    if (extra?.entregadorId) {
      entregadores = entregadores.map((e) =>
        e.id === extra.entregadorId ? { ...e, status: "em_entrega", pedidoId: id, destino: { x: 0.2 + Math.random() * 0.6, y: 0.15 + Math.random() * 0.7 } } : e,
      );
    }
    return mockResponse(pedidos.find((p) => p.id === id)!);
  }
  return api.patch<Pedido>(`/v1/restaurante/pedidos/${id}/status`, { status, ...extra });
}

/* ---------- Entregadores ---------- */

/** TODO backend: GET /v1/restaurante/entregadores */
export async function listarEntregadores(): Promise<Entregador[]> {
  if (USE_MOCKS) return mockResponse(entregadores);
  return api.get<Entregador[]>("/v1/restaurante/entregadores");
}

export async function cadastrarEntregador(novo: Omit<Entregador, "id" | "posicao" | "entregasHoje" | "avaliacao" | "atualizadoEm" | "status">) {
  if (USE_MOCKS) {
    const e: Entregador = {
      ...novo, id: `e${Date.now()}`, status: "offline", posicao: { x: 0.5, y: 0.45 },
      entregasHoje: 0, avaliacao: 5, atualizadoEm: new Date().toISOString(),
    };
    entregadores = [...entregadores, e];
    return mockResponse(e);
  }
  return api.post<Entregador>("/v1/restaurante/entregadores", novo as unknown as Record<string, unknown>);
}

export async function alterarDisponibilidade(id: string, status: "disponivel" | "offline") {
  if (USE_MOCKS) {
    entregadores = entregadores.map((e) => (e.id === id ? { ...e, status, atualizadoEm: new Date().toISOString() } : e));
    return mockResponse(entregadores);
  }
  return api.patch<Entregador[]>(`/v1/restaurante/entregadores/${id}`, { status });
}

export async function removerEntregador(id: string) {
  if (USE_MOCKS) {
    entregadores = entregadores.filter((e) => e.id !== id);
    return mockResponse(true);
  }
  return api.delete<boolean>(`/v1/restaurante/entregadores/${id}`);
}

/**
 * Posições em tempo real. No backend real isto deve virar WebSocket/SSE
 * (ex.: /v1/restaurante/entregadores/stream). No modo mock, move cada
 * entregador em direção ao destino a cada chamada.
 */
export async function obterPosicoes(): Promise<Pick<Entregador, "id" | "posicao" | "status" | "atualizadoEm">[]> {
  if (USE_MOCKS) {
    entregadores = entregadores.map((e) => {
      if (e.status !== "em_entrega" || !e.destino) return e;
      const dx = e.destino.x - e.posicao.x;
      const dy = e.destino.y - e.posicao.y;
      const dist = Math.hypot(dx, dy);
      const passo = 0.012;
      const atualizadoEm = new Date().toISOString();
      // Ao chegar, segue para outro ponto: mantém o mapa em movimento na demonstração.
      if (dist < passo) return { ...e, posicao: { ...e.destino }, destino: { x: 0.12 + Math.random() * 0.76, y: 0.12 + Math.random() * 0.76 }, atualizadoEm };
      return { ...e, posicao: { x: e.posicao.x + (dx / dist) * passo, y: e.posicao.y + (dy / dist) * passo }, atualizadoEm };
    });
    return mockResponse(entregadores.map(({ id, posicao, status, atualizadoEm }) => ({ id, posicao, status, atualizadoEm })), 50);
  }
  return api.get("/v1/restaurante/entregadores/posicoes");
}

export const posicaoLoja = posicaoLojaMock;

/* ---------- Estoque ---------- */

/** TODO backend: GET /v1/restaurante/estoque */
export async function listarEstoque(): Promise<ItemEstoque[]> {
  if (USE_MOCKS) return mockResponse(estoque);
  return api.get<ItemEstoque[]>("/v1/restaurante/estoque");
}

export async function listarMovimentos(): Promise<MovimentoEstoque[]> {
  if (USE_MOCKS) return mockResponse(movimentos);
  return api.get<MovimentoEstoque[]>("/v1/restaurante/estoque/movimentos");
}

export async function salvarItemEstoque(item: ItemEstoque) {
  if (USE_MOCKS) {
    const existe = estoque.some((i) => i.id === item.id);
    estoque = existe ? estoque.map((i) => (i.id === item.id ? item : i)) : [...estoque, { ...item, id: `i${Date.now()}` }];
    return mockResponse(estoque);
  }
  return api.put<ItemEstoque[]>(`/v1/restaurante/estoque/${item.id}`, item as unknown as Record<string, unknown>);
}

export async function registrarMovimento(mov: Omit<MovimentoEstoque, "id" | "data">) {
  if (USE_MOCKS) {
    const novo: MovimentoEstoque = { ...mov, id: `m${Date.now()}`, data: new Date().toISOString() };
    movimentos = [novo, ...movimentos];
    estoque = estoque.map((i) =>
      i.id === mov.itemId ? { ...i, quantidade: Math.max(0, i.quantidade + (mov.tipo === "entrada" ? mov.quantidade : -mov.quantidade)) } : i,
    );
    return mockResponse({ estoque, movimentos });
  }
  return api.post<{ estoque: ItemEstoque[]; movimentos: MovimentoEstoque[] }>("/v1/restaurante/estoque/movimentos", mov as unknown as Record<string, unknown>);
}

/* ---------- Produtos / preços ---------- */

/** GET /v1/cardapio/produtos (rota do frame "Cardapio - api/v1/cardapio/produtos" no Figma) */
export async function listarProdutos(): Promise<Produto[]> {
  if (USE_MOCKS) return mockResponse(produtos);
  return api.get<Produto[]>("/v1/cardapio/produtos");
}

/** Produto sem `id` é criado; com `id`, atualizado. A imagem vai junto em multipart. */
export async function salvarProduto(produto: Produto, imagem?: File) {
  if (USE_MOCKS) {
    const salvo = imagem ? { ...produto, imagem: URL.createObjectURL(imagem) } : produto;
    produtos = produto.id ? produtos.map((p) => (p.id === produto.id ? salvo : p)) : [...produtos, { ...salvo, id: `pr${Date.now()}` }];
    return mockResponse(produtos);
  }
  const form = new FormData();
  form.append("produto", JSON.stringify(produto));
  if (imagem) form.append("imagem", imagem);
  return produto.id ? api.put<Produto[]>(`/v1/cardapio/produtos/${produto.id}`, form) : api.post<Produto[]>("/v1/cardapio/produtos", form);
}

export async function removerProduto(id: string) {
  if (USE_MOCKS) {
    produtos = produtos.filter((p) => p.id !== id);
    return mockResponse(produtos);
  }
  return api.delete<Produto[]>(`/v1/cardapio/produtos/${id}`);
}

export async function atualizarPrecos(alteracoes: { id: string; preco: number }[]) {
  if (USE_MOCKS) {
    const mapa = new Map(alteracoes.map((a) => [a.id, a.preco]));
    produtos = produtos.map((p) => (mapa.has(p.id) ? { ...p, preco: mapa.get(p.id)!, status: "processando" } : p));
    return mockResponse(produtos);
  }
  return api.patch<Produto[]>("/v1/cardapio/produtos/precos", alteracoes);
}
