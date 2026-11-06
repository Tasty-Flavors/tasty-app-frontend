import type { Avaliacao, Desempenho, Fatura, Lancamento, Plano } from "@/types";
import { diasAFrente, diasAtras } from "./util";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const desempenhoMock: Desempenho = {
  faturamento: 18420.5,
  faturamentoAnterior: 16210.0,
  pedidos: 512,
  pedidosAnterior: 471,
  ticketMedio: 35.98,
  ticketMedioAnterior: 34.42,
  tempoMedioPreparoMin: 17,
  taxaCancelamento: 0.031,
  faturamentoPorDia: [1980, 2140, 2310, 2590, 3420, 3610, 2370].map((valor, i) => ({ rotulo: dias[i]!, valor })),
  pedidosPorHora: [
    ["11h", 18], ["12h", 64], ["13h", 52], ["14h", 21], ["15h", 9], ["16h", 8], ["17h", 14],
    ["18h", 36], ["19h", 71], ["20h", 88], ["21h", 69], ["22h", 41], ["23h", 21],
  ].map(([rotulo, valor]) => ({ rotulo: rotulo as string, valor: valor as number })),
  maisVendidos: [
    { nome: "Refrigerante lata", quantidade: 410, receita: 2460 },
    { nome: "X-Bacon", quantidade: 341, receita: 9889 },
    { nome: "Prato feito", quantidade: 298, receita: 10430 },
    { nome: "Açaí 500ml", quantidade: 274, receita: 6028 },
    { nome: "Batata frita média", quantidade: 260, receita: 4680 },
  ],
  canais: [
    { nome: "App Tasty", pedidos: 341 },
    { nome: "Retirada no balcão", pedidos: 104 },
    { nome: "WhatsApp", pedidos: 67 },
  ],
};

export const lancamentosMock: Lancamento[] = [
  { id: "l1", data: diasAtras(0), descricao: "Vendas do dia (42 pedidos)", tipo: "venda", valor: 1512.4, status: "processando" },
  { id: "l2", data: diasAtras(1), descricao: "Vendas do dia (71 pedidos)", tipo: "venda", valor: 2590.0, status: "previsto" },
  { id: "l3", data: diasAtras(1), descricao: "Comissão Tasty (12%)", tipo: "taxa", valor: -310.8, status: "previsto" },
  { id: "l4", data: diasAtras(2), descricao: "Estorno pedido #1012", tipo: "estorno", valor: -35.0, status: "liquidado" },
  { id: "l5", data: diasAtras(3), descricao: "Repasse semanal", tipo: "repasse", valor: 9840.22, status: "liquidado" },
  { id: "l6", data: diasAtras(3), descricao: "Taxa de entrega (repasse a entregadores)", tipo: "taxa", valor: -612.0, status: "liquidado" },
  { id: "l7", data: diasAtras(4), descricao: "Vendas do dia (66 pedidos)", tipo: "venda", valor: 2310.0, status: "liquidado" },
];

export const faturasMock: Fatura[] = [
  { id: "f1", competencia: "Novembro/2026", vencimento: diasAFrente(9), valor: 149.9, status: "aberta" },
  { id: "f2", competencia: "Outubro/2026", vencimento: diasAtras(21), valor: 149.9, status: "paga" },
  { id: "f3", competencia: "Setembro/2026", vencimento: diasAtras(51), valor: 149.9, status: "paga" },
];

export const avaliacoesMock: Avaliacao[] = [
  { id: "a1", cliente: "Ana Ribeiro", nota: 5, comentario: "Hambúrguer de siri sensacional, chegou quentinho!", data: diasAtras(0), pedidoNumero: 1031, tags: ["Sabor", "Entrega rápida"] },
  { id: "a2", cliente: "Bruno Lima", nota: 4, comentario: "Açaí muito bom, mas veio com pouca granola.", data: diasAtras(1), pedidoNumero: 1027, tags: ["Sabor"] },
  { id: "a3", cliente: "Diego Alves", nota: 2, comentario: "Demorou mais de uma hora para chegar e a batata estava fria.", data: diasAtras(1), pedidoNumero: 1019, tags: ["Atraso", "Temperatura"] },
  { id: "a4", cliente: "Eduarda Costa", nota: 5, comentario: "Prato feito caprichado, igual comida de casa.", data: diasAtras(2), pedidoNumero: 1015, resposta: "Obrigado, Eduarda! Volte sempre.", tags: ["Porção", "Sabor"] },
  { id: "a5", cliente: "Gabriela Rocha", nota: 3, comentario: "Bom, mas a embalagem do combo abriu no caminho.", data: diasAtras(4), pedidoNumero: 1002, tags: ["Embalagem"] },
  { id: "a6", cliente: "Henrique Dias", nota: 5, comentario: "Melhor X-Bacon da Cidade Baixa.", data: diasAtras(5), pedidoNumero: 998, resposta: "Valeu, Henrique!", tags: ["Sabor"] },
];

export const distribuicaoNotasMock: Record<1 | 2 | 3 | 4 | 5, number> = { 5: 98, 4: 22, 3: 8, 2: 4, 1: 3 };

export const planosMock: Plano[] = [
  {
    id: "basico", nome: "Básico", precoMensal: 0, comissao: 0.18,
    descricao: "Para começar a vender na Tasty sem mensalidade.",
    recursos: ["Cardápio digital", "Gestão de pedidos", "Repasse semanal", "Suporte por e-mail"],
  },
  {
    id: "pro", nome: "Pro", precoMensal: 149.9, comissao: 0.12,
    descricao: "Mais visibilidade e ferramentas de operação.",
    recursos: ["Tudo do Básico", "Entregadores próprios com rastreamento", "Controle de estoque e validade", "Promoções e cupons", "Repasse a cada 2 dias"],
    destaque: true,
  },
  {
    id: "premium", nome: "Premium", precoMensal: 299.9, comissao: 0.08,
    descricao: "Para restaurantes que querem crescer rápido.",
    recursos: ["Tudo do Pro", "Anúncios com R$ 200/mês de crédito", "Selo Premium na busca", "Relatórios avançados", "Repasse diário", "Gerente de conta dedicado"],
  },
];
