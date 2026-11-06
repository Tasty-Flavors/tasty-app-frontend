import { api, mockResponse } from "@/lib/api";
import { USE_MOCKS } from "@/lib/config";
import type { Coordenada, Entregador, ItemEstoque, MovimentoEstoque, Pedido, PontoRota, Produto, StatusPedido } from "@/types";
import { entregadoresMock, estoqueMock, movimentosEstoqueMock, pedidosMock, produtosMock, referenciaPosicoesMock } from "@/mocks/operacao";
import { calcularRota, localizarEndereco, pontoNaRua } from "@/mocks/rotas";
import { obterLocalizacaoLoja } from "./loja";

/*
 * Endpoints marcados com TODO ainda não existem no BFF; os caminhos são uma
 * proposta e podem ser ajustados sem mexer nas telas.
 */

let pedidos = structuredClone(pedidosMock);
let entregadores = structuredClone(entregadoresMock);
let estoque = structuredClone(estoqueMock);
let movimentos = structuredClone(movimentosEstoqueMock);
let produtos = structuredClone(produtosMock);

let lojaSimulada: Coordenada | null = null;
const SEM_ROTA = { destino: undefined, rota: undefined, chegadaEm: undefined };

const baseSimulacao = () => lojaSimulada ?? referenciaPosicoesMock;

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
        e.pedidoId === id ? { ...e, status: "disponivel", pedidoId: undefined, ...SEM_ROTA, entregasHoje: e.entregasHoje + 1 } : e,
      );
    }
    if (extra?.entregadorId) {
      voltandoParaLoja.delete(extra.entregadorId);
      entregadores = entregadores.map((e) =>
        e.id === extra.entregadorId ? { ...e, status: "em_entrega", pedidoId: id, ...SEM_ROTA } : e,
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
      ...novo, id: `e${Date.now()}`, status: "offline", posicao: { ...baseSimulacao() },
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

/* Simulação: só no modo mock. Com o BFF, posições, rota, trânsito e chegada vêm do backend. */

const SEGUNDOS_POR_LEITURA = 2;
const METROS_POR_GRAU = 111_320;
const NOVA_TENTATIVA_ROTA_MS = 30_000;
/** Quanto da velocidade normal sobra num trecho com trânsito. A bike passa ao lado da fila. */
const VELOCIDADE_NO_TRANSITO: Record<Entregador["veiculo"], number> = { Moto: 0.5, Carro: 0.3, Bike: 1 };
const COMPRIMENTO_TRECHO_TRANSITO_M = 350;
const CHANCE_TRANSITO = 0.4;

const voltandoParaLoja = new Set<string>();
const rotasPendentes = new Set<string>();
/** Metros por segundo sem trânsito, vindos da duração prevista pelo roteador. */
const velocidades = new Map<string, number>();

function distanciaM(a: Coordenada, b: Coordenada) {
  return Math.hypot(b.lat - a.lat, (b.lng - a.lng) * Math.cos((a.lat * Math.PI) / 180)) * METROS_POR_GRAU;
}

/** Trânsito fictício, mas estável: o mesmo lugar dá sempre o mesmo resultado. */
function temTransitoSimulado({ lat, lng }: Coordenada) {
  const x = Math.sin(lat * 12_989.8 + lng * 78_233.1) * 43_758.5;
  return x - Math.floor(x) < CHANCE_TRANSITO;
}

function marcarTransitoSimulado(pontos: Coordenada[], veiculo: Entregador["veiculo"]): PontoRota[] {
  if (VELOCIDADE_NO_TRANSITO[veiculo] === 1) return pontos;
  let percorrido = 0;
  let transito = false;
  let proximoSorteio = 0;
  return pontos.map((ponto, i) => {
    if (percorrido >= proximoSorteio) {
      transito = temTransitoSimulado(ponto);
      proximoSorteio = percorrido + COMPRIMENTO_TRECHO_TRANSITO_M;
    }
    const seguinte = pontos[i + 1];
    if (seguinte) percorrido += distanciaM(ponto, seguinte);
    return { ...ponto, transito };
  });
}

/** Avança pela rota durante `segundos`, mais devagar nos trechos com trânsito. Sobra um só ponto na chegada. */
function andarPelaRota(rota: PontoRota[], segundos: number, veiculo: Entregador["veiculo"], velocidade: number): PontoRota[] {
  let restante = segundos;
  for (let i = 0; i < rota.length - 1; i++) {
    const de = rota[i]!;
    const para = rota[i + 1]!;
    const metrosPorSegundo = velocidade * (de.transito ? VELOCIDADE_NO_TRANSITO[veiculo] : 1);
    const duracao = distanciaM(de, para) / metrosPorSegundo;
    if (duracao > restante) {
      const t = restante / duracao;
      return [{ ...de, lat: de.lat + (para.lat - de.lat) * t, lng: de.lng + (para.lng - de.lng) * t }, ...rota.slice(i + 1)];
    }
    restante -= duracao;
  }
  return rota.slice(-1);
}

function previsaoChegada(rota: PontoRota[], veiculo: Entregador["veiculo"], velocidade: number) {
  const segundos = rota.slice(0, -1).reduce((soma, de, i) => {
    const metrosPorSegundo = velocidade * (de.transito ? VELOCIDADE_NO_TRANSITO[veiculo] : 1);
    return soma + distanciaM(de, rota[i + 1]!) / metrosPorSegundo;
  }, 0);
  return new Date(Date.now() + segundos * 1000).toISOString();
}

/** Endereço do pedido, buscado só na região da loja; se não existir, um ponto próximo. */
async function destinoDaEntrega(e: Entregador): Promise<Coordenada> {
  const base = baseSimulacao();
  const rua = pedidos.find((p) => p.id === e.pedidoId)?.endereco?.split("—")[0]?.trim();
  const achado = rua ? await localizarEndereco(rua, base) : null;
  return achado ?? { lat: base.lat + (Math.random() - 0.5) * 0.03, lng: base.lng + (Math.random() - 0.5) * 0.03 };
}

async function planejarRota(e: Entregador) {
  if (rotasPendentes.has(e.id)) return;
  rotasPendentes.add(e.id);
  const alvo = voltandoParaLoja.has(e.id) ? baseSimulacao() : await destinoDaEntrega(e);
  const calculada = await calcularRota(e.posicao, alvo, e.veiculo);
  if (!calculada?.pontos.length) {
    setTimeout(() => rotasPendentes.delete(e.id), NOVA_TENTATIVA_ROTA_MS);
    return;
  }
  rotasPendentes.delete(e.id);
  const velocidade = calculada.distanciaM / Math.max(calculada.duracaoS, 1);
  velocidades.set(e.id, velocidade);
  const rota = marcarTransitoSimulado(calculada.pontos, e.veiculo);
  entregadores = entregadores.map((x) =>
    x.id === e.id && x.status === "em_entrega" && x.pedidoId === e.pedidoId
      ? { ...x, posicao: { lat: rota[0]!.lat, lng: rota[0]!.lng }, rota, destino: rota.at(-1), chegadaEm: previsaoChegada(rota, e.veiculo, velocidade) }
      : x,
  );
}

function avancarEntregador(e: Entregador): Entregador {
  if (e.status !== "em_entrega") return e;
  const velocidade = velocidades.get(e.id);
  if (!e.rota || !velocidade) {
    void planejarRota(e);
    return e;
  }
  const atualizadoEm = new Date().toISOString();
  const rota = andarPelaRota(e.rota, SEGUNDOS_POR_LEITURA, e.veiculo, velocidade);
  const posicao = { lat: rota[0]!.lat, lng: rota[0]!.lng };
  if (rota.length > 1) return { ...e, posicao, rota, chegadaEm: previsaoChegada(rota, e.veiculo, velocidade), atualizadoEm };
  // Ao chegar, faz o caminho inverso: mantém o mapa em movimento na demonstração.
  if (!voltandoParaLoja.delete(e.id)) voltandoParaLoja.add(e.id);
  return { ...e, posicao, ...SEM_ROTA, atualizadoEm };
}

/** Coloca a frota simulada onde a loja está. Refaz tudo se o endereço cadastrado mudar. */
async function sincronizarSimulacao(loja: Coordenada) {
  if (lojaSimulada?.lat === loja.lat && lojaSimulada.lng === loja.lng) return;
  const anterior = baseSimulacao();
  lojaSimulada = loja;
  voltandoParaLoja.clear();
  entregadores = await Promise.all(
    entregadores.map(async (e) =>
      e.status === "em_entrega"
        ? { ...e, posicao: { ...loja }, ...SEM_ROTA }
        : { ...e, posicao: await pontoNaRua({ lat: e.posicao.lat + loja.lat - anterior.lat, lng: e.posicao.lng + loja.lng - anterior.lng }) },
    ),
  );
}

/** Ponto da loja no mapa. Chame antes de listar a frota, que no modo mock parte dele. */
export async function obterPosicaoLoja(): Promise<Coordenada | null> {
  const loja = await obterLocalizacaoLoja();
  if (USE_MOCKS && loja) await sincronizarSimulacao(loja);
  return loja;
}

/**
 * GET /v1/restaurante/entregadores/posicoes, lido a cada 2 s. Em entrega, o BFF também
 * devolve `destino`, `rota` (caminho pelas ruas, com `transito` por trecho) e `chegadaEm`.
 * Sem `rota`, o mapa não desenha linha; sem `chegadaEm`, não mostra previsão.
 */
export async function obterPosicoes(): Promise<Pick<Entregador, "id" | "posicao" | "status" | "atualizadoEm" | "destino" | "rota" | "chegadaEm">[]> {
  if (USE_MOCKS) {
    entregadores = entregadores.map(avancarEntregador);
    return mockResponse(entregadores.map(({ id, posicao, status, atualizadoEm, destino, rota, chegadaEm }) => ({ id, posicao, status, atualizadoEm, destino, rota, chegadaEm })), 50);
  }
  return api.get("/v1/restaurante/entregadores/posicoes");
}

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
