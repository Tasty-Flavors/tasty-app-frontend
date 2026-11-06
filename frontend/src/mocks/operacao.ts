import type { Entregador, ItemEstoque, MovimentoEstoque, Pedido, Produto } from "@/types";
import { diasAFrente, diasAtras, minutosAtras } from "./util";

const total = (itens: Pedido["itens"], taxa: number) =>
  Math.round((itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0) + taxa) * 100) / 100;

const p = (o: Omit<Pedido, "total">): Pedido => ({ ...o, total: total(o.itens, o.taxaEntrega) });

export const pedidosMock: Pedido[] = [
  p({
    id: "p1", numero: 1048, cliente: "Ana Ribeiro", telefone: "(51) 99876-1122", status: "novo", tipo: "entrega",
    pagamento: "PIX", criadoEm: minutosAtras(2), endereco: "Rua da República, 410 — Cidade Baixa", taxaEntrega: 6,
    itens: [{ nome: "Hambúrguer de siri", quantidade: 2, precoUnitario: 35 }, { nome: "Refrigerante lata", quantidade: 2, precoUnitario: 6 }],
  }),
  p({
    id: "p2", numero: 1047, cliente: "Bruno Lima", telefone: "(51) 98123-4455", status: "novo", tipo: "retirada",
    pagamento: "Cartão de crédito", criadoEm: minutosAtras(5), taxaEntrega: 0,
    itens: [{ nome: "Açaí 500ml", quantidade: 1, precoUnitario: 22, observacao: "Sem banana" }],
  }),
  p({
    id: "p3", numero: 1046, cliente: "Carla Mendes", telefone: "(51) 99654-7788", status: "em_preparo", tipo: "entrega",
    pagamento: "Cartão de débito", criadoEm: minutosAtras(14), endereco: "Av. Borges de Medeiros, 1500 — Centro", taxaEntrega: 5,
    itens: [{ nome: "Prato feito (frango)", quantidade: 1, precoUnitario: 35 }, { nome: "Suco de laranja", quantidade: 1, precoUnitario: 9 }],
    observacao: "Interfone com defeito, ligar ao chegar",
  }),
  p({
    id: "p4", numero: 1045, cliente: "Diego Alves", telefone: "(51) 99432-9900", status: "em_preparo", tipo: "entrega",
    pagamento: "PIX", criadoEm: minutosAtras(19), endereco: "Rua Lima e Silva, 88 — Cidade Baixa", taxaEntrega: 6,
    itens: [{ nome: "X-Bacon", quantidade: 3, precoUnitario: 29 }, { nome: "Batata frita média", quantidade: 1, precoUnitario: 18 }],
  }),
  p({
    id: "p5", numero: 1044, cliente: "Eduarda Costa", telefone: "(51) 98765-3321", status: "pronto", tipo: "retirada",
    pagamento: "Dinheiro", criadoEm: minutosAtras(26), taxaEntrega: 0,
    itens: [{ nome: "Prato feito (bife)", quantidade: 2, precoUnitario: 35 }],
  }),
  p({
    id: "p6", numero: 1043, cliente: "Fábio Teixeira", telefone: "(51) 99111-2233", status: "em_entrega", tipo: "entrega",
    pagamento: "PIX", criadoEm: minutosAtras(33), endereco: "Rua Fernando Machado, 720 — Centro", taxaEntrega: 5, entregadorId: "e1",
    itens: [{ nome: "Hambúrguer de siri", quantidade: 1, precoUnitario: 35 }, { nome: "Açaí 300ml", quantidade: 1, precoUnitario: 16 }],
  }),
  p({
    id: "p7", numero: 1042, cliente: "Gabriela Rocha", telefone: "(51) 99222-3344", status: "em_entrega", tipo: "entrega",
    pagamento: "Cartão de crédito", criadoEm: minutosAtras(41), endereco: "Rua José do Patrocínio, 300 — Cidade Baixa", taxaEntrega: 6, entregadorId: "e3",
    itens: [{ nome: "Combo família", quantidade: 1, precoUnitario: 89 }],
  }),
  p({
    id: "p8", numero: 1041, cliente: "Henrique Dias", telefone: "(51) 98333-4455", status: "concluido", tipo: "entrega",
    pagamento: "PIX", criadoEm: minutosAtras(75), endereco: "Rua Duque de Caxias, 1200 — Centro", taxaEntrega: 5, entregadorId: "e2",
    itens: [{ nome: "X-Salada", quantidade: 2, precoUnitario: 26 }],
  }),
  p({
    id: "p9", numero: 1040, cliente: "Isabela Nunes", telefone: "(51) 98444-5566", status: "concluido", tipo: "retirada",
    pagamento: "Cartão de débito", criadoEm: minutosAtras(98), taxaEntrega: 0,
    itens: [{ nome: "Açaí 500ml", quantidade: 2, precoUnitario: 22 }],
  }),
  p({
    id: "p10", numero: 1039, cliente: "João Martins", telefone: "(51) 98555-6677", status: "recusado", tipo: "entrega",
    pagamento: "PIX", criadoEm: minutosAtras(120), endereco: "Av. Ipiranga, 6681 — Partenon", taxaEntrega: 12,
    itens: [{ nome: "Prato feito (frango)", quantidade: 1, precoUnitario: 35 }],
    observacao: "Fora da área de entrega",
  }),
];

export const entregadoresMock: Entregador[] = [
  {
    id: "e1", nome: "Rodolfo Rolfodo", cpf: "123.456.789-10", telefone: "(51) 99900-1010", veiculo: "Moto", placa: "IVI2213F",
    chavePix: "ro@gmail.com", tipoChavePix: "Email", status: "em_entrega", posicao: { lat: -30.0340, lng: -51.2230 }, destino: { lat: -30.0270, lng: -51.2320 },
    pedidoId: "p6", entregasHoje: 7, avaliacao: 4.9, atualizadoEm: minutosAtras(0),
  },
  {
    id: "e2", nome: "Patrícia Moura", cpf: "987.654.321-00", telefone: "(51) 99900-2020", veiculo: "Bike",
    chavePix: "(51) 99900-2020", tipoChavePix: "Telefone", status: "disponivel", posicao: { lat: -30.0420, lng: -51.2165 },
    entregasHoje: 4, avaliacao: 4.8, atualizadoEm: minutosAtras(1),
  },
  {
    id: "e3", nome: "Marcos Vieira", cpf: "321.654.987-11", telefone: "(51) 99900-3030", veiculo: "Moto", placa: "JAB4C21",
    chavePix: "321.654.987-11", tipoChavePix: "CPF", status: "em_entrega", posicao: { lat: -30.0510, lng: -51.2110 }, destino: { lat: -30.0570, lng: -51.2050 },
    pedidoId: "p7", entregasHoje: 9, avaliacao: 4.6, atualizadoEm: minutosAtras(0),
  },
  {
    id: "e4", nome: "Luana Freitas", cpf: "456.789.123-22", telefone: "(51) 99900-4040", veiculo: "Carro", placa: "IXZ8E90",
    chavePix: "a1b2c3d4-e5f6-4711-8899-aabbccddeeff", tipoChavePix: "Aleatória", status: "offline", posicao: { lat: -30.0535, lng: -51.2340 },
    entregasHoje: 0, avaliacao: 4.7, atualizadoEm: minutosAtras(180),
  },
];

/** Posição da loja (Centro Histórico de Porto Alegre, dado fictício). */
export const posicaoLojaMock = { lat: -30.0385, lng: -51.2190 };

export const estoqueMock: ItemEstoque[] = [
  { id: "i1", nome: "Pão de hambúrguer brioche", categoria: "Padaria", unidade: "un", quantidade: 46, minimo: 60, custoUnitario: 1.2, validade: diasAFrente(2), lote: "PB-2211", fornecedor: "Padaria Central" },
  { id: "i2", nome: "Carne de siri", categoria: "Proteínas", unidade: "kg", quantidade: 3.5, minimo: 2, custoUnitario: 89.9, validade: diasAFrente(1), lote: "SR-0981", fornecedor: "Pescados Guaíba" },
  { id: "i3", nome: "Blend bovino 150 g", categoria: "Proteínas", unidade: "un", quantidade: 120, minimo: 80, custoUnitario: 4.8, validade: diasAFrente(12), lote: "BB-5521", fornecedor: "Frigorífico Pampa" },
  { id: "i4", nome: "Polpa de açaí", categoria: "Congelados", unidade: "kg", quantidade: 8, minimo: 10, custoUnitario: 24.5, validade: diasAFrente(60), lote: "AC-3310", fornecedor: "Açaí do Norte" },
  { id: "i5", nome: "Alface americana", categoria: "Hortifrúti", unidade: "un", quantidade: 6, minimo: 10, custoUnitario: 3.5, validade: diasAFrente(0), lote: "HF-1102", fornecedor: "Ceasa POA" },
  { id: "i6", nome: "Tomate", categoria: "Hortifrúti", unidade: "kg", quantidade: 5, minimo: 4, custoUnitario: 7.9, validade: diasAFrente(4), lote: "HF-1103", fornecedor: "Ceasa POA" },
  { id: "i7", nome: "Queijo parmesão", categoria: "Laticínios", unidade: "kg", quantidade: 1.2, minimo: 2, custoUnitario: 79.0, validade: diasAFrente(21), lote: "LT-7741", fornecedor: "Laticínios Serra" },
  { id: "i8", nome: "Bacon fatiado", categoria: "Proteínas", unidade: "kg", quantidade: 4, minimo: 3, custoUnitario: 42.0, validade: diasAFrente(6), lote: "BC-2290", fornecedor: "Frigorífico Pampa" },
  { id: "i9", nome: "Leite em pó", categoria: "Mercearia", unidade: "kg", quantidade: 0.4, minimo: 2, custoUnitario: 38.0, validade: diasAFrente(120), lote: "MC-0045", fornecedor: "Atacado Sul" },
  { id: "i10", nome: "Refrigerante lata", categoria: "Bebidas", unidade: "un", quantidade: 96, minimo: 48, custoUnitario: 2.9, validade: diasAFrente(180), lote: "BE-8890", fornecedor: "Distribuidora Gaúcha" },
  { id: "i11", nome: "Creme de leite", categoria: "Laticínios", unidade: "cx", quantidade: 12, minimo: 6, custoUnitario: 4.2, validade: diasAtras(1), lote: "LT-7702", fornecedor: "Laticínios Serra" },
  { id: "i12", nome: "Batata congelada", categoria: "Congelados", unidade: "kg", quantidade: 18, minimo: 10, custoUnitario: 14.9, validade: diasAFrente(90), lote: "CG-4410", fornecedor: "Atacado Sul" },
];

export const movimentosEstoqueMock: MovimentoEstoque[] = [
  { id: "m1", itemId: "i3", tipo: "entrada", quantidade: 80, data: diasAtras(0), motivo: "Compra NF 4421" },
  { id: "m2", itemId: "i1", tipo: "saida", quantidade: 34, data: diasAtras(0), motivo: "Consumo de pedidos" },
  { id: "m3", itemId: "i5", tipo: "perda", quantidade: 4, data: diasAtras(1), motivo: "Folhas murchas" },
  { id: "m4", itemId: "i10", tipo: "entrada", quantidade: 48, data: diasAtras(2), motivo: "Compra NF 4398" },
];

export const produtosMock: Produto[] = [
  { id: "pr1", nome: "Hambúrguer de siri", descricao: "Hambúrguer de siri, ovo, alface, tomate, queijo parmesão e bacon", categoria: "Lanches", preco: 35, custo: 14.6, ativo: true, status: "processando", vendidos30d: 212 },
  { id: "pr2", nome: "X-Bacon", descricao: "Blend bovino 150 g, cheddar, bacon crocante e maionese da casa", categoria: "Lanches", preco: 29, custo: 11.2, ativo: true, status: "aprovado", vendidos30d: 341 },
  { id: "pr3", nome: "X-Salada", descricao: "Blend bovino 150 g, queijo, alface e tomate", categoria: "Lanches", preco: 26, custo: 9.4, ativo: true, status: "aprovado", vendidos30d: 188 },
  { id: "pr4", nome: "Açaí 300ml", descricao: "Açaí, granola e banana", categoria: "Sobremesas", preco: 16, custo: 6.1, ativo: true, status: "aprovado", vendidos30d: 156 },
  { id: "pr5", nome: "Açaí 500ml", descricao: "Açaí, Nutella, M&M's, leite em pó e banana", categoria: "Sobremesas", preco: 22, custo: 11.6, ativo: true, status: "processando", vendidos30d: 274 },
  { id: "pr6", nome: "Prato feito", descricao: "Arroz, feijão, salada (tomate, alface), carne (frango ou bife) e batata frita", categoria: "Pratos", preco: 35, custo: 18.2, ativo: true, status: "aprovado", vendidos30d: 298 },
  { id: "pr7", nome: "Salada Fit", descricao: "Mix de folhas, frango grelhado, tomate-cereja e molho de iogurte", categoria: "Fit", preco: 28, custo: 10.5, ativo: false, status: "pausado", vendidos30d: 22 },
  { id: "pr8", nome: "Batata frita média", descricao: "Porção de 300 g", categoria: "Lanches", preco: 18, custo: 4.9, ativo: true, status: "aprovado", vendidos30d: 260 },
  { id: "pr9", nome: "Refrigerante lata", descricao: "350 ml", categoria: "Bebidas", preco: 6, custo: 2.9, ativo: true, status: "aprovado", vendidos30d: 410 },
  { id: "pr10", nome: "Suco de laranja", descricao: "Natural, 400 ml", categoria: "Bebidas", preco: 9, custo: 3.1, ativo: true, status: "aprovado", vendidos30d: 132 },
  { id: "pr11", nome: "Combo família", descricao: "3 X-Salada, 1 batata grande e 1 refrigerante 2L", categoria: "Lanches", preco: 89, custo: 38.0, ativo: true, status: "aprovado", vendidos30d: 64 },
  { id: "pr12", nome: "Pão na chapa com café", descricao: "Pão francês na chapa e café passado", categoria: "Café da manhã", preco: 12, custo: 3.4, ativo: true, status: "editando", vendidos30d: 0 },
];
