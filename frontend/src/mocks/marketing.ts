import type { Anuncio, Cliente, Parceria, PostFeed, Promocao } from "@/types";
import { diasAFrente, diasAtras } from "./util";

export const clientesMock: Cliente[] = [
  { id: "c1", nome: "Ana Ribeiro", telefone: "(51) 99876-1122", pedidos: 23, totalGasto: 912.5, ultimoPedido: diasAtras(0), segmento: "Fiel", bairro: "Cidade Baixa" },
  { id: "c2", nome: "Bruno Lima", telefone: "(51) 98123-4455", pedidos: 9, totalGasto: 241.0, ultimoPedido: diasAtras(1), segmento: "Recorrente", bairro: "Centro" },
  { id: "c3", nome: "Carla Mendes", telefone: "(51) 99654-7788", pedidos: 2, totalGasto: 88.0, ultimoPedido: diasAtras(0), segmento: "Novo", bairro: "Centro" },
  { id: "c4", nome: "Diego Alves", telefone: "(51) 99432-9900", pedidos: 14, totalGasto: 503.2, ultimoPedido: diasAtras(1), segmento: "Recorrente", bairro: "Cidade Baixa" },
  { id: "c5", nome: "Eduarda Costa", telefone: "(51) 98765-3321", pedidos: 31, totalGasto: 1288.0, ultimoPedido: diasAtras(2), segmento: "Fiel", bairro: "Menino Deus" },
  { id: "c6", nome: "Fábio Teixeira", telefone: "(51) 99111-2233", pedidos: 1, totalGasto: 56.0, ultimoPedido: diasAtras(0), segmento: "Novo", bairro: "Centro" },
  { id: "c7", nome: "Lucas Prado", telefone: "(51) 99555-1212", pedidos: 6, totalGasto: 198.0, ultimoPedido: diasAtras(48), segmento: "Inativo", bairro: "Bom Fim" },
  { id: "c8", nome: "Mariana Silva", telefone: "(51) 99777-3434", pedidos: 4, totalGasto: 131.5, ultimoPedido: diasAtras(63), segmento: "Inativo", bairro: "Farroupilha" },
];

export const promocoesMock: Promocao[] = [
  { id: "pm1", titulo: "Terça do Açaí", tipo: "percentual", valor: 20, aplicaEm: "Sobremesas", inicio: diasAtras(10), fim: diasAFrente(20), status: "ativa", usos: 87, receitaGerada: 1520 },
  { id: "pm2", titulo: "Frete grátis acima de R$ 60", tipo: "frete_gratis", valor: 0, aplicaEm: "Todo o cardápio", inicio: diasAtras(3), fim: diasAFrente(4), status: "ativa", usos: 41, receitaGerada: 3120 },
  { id: "pm3", titulo: "Combo almoço", tipo: "combo", valor: 39.9, aplicaEm: "Prato feito + suco", inicio: diasAFrente(2), fim: diasAFrente(32), status: "agendada", usos: 0, receitaGerada: 0 },
  { id: "pm4", titulo: "R$ 10 OFF primeira compra", tipo: "valor", valor: 10, aplicaEm: "Novos clientes", inicio: diasAtras(40), fim: diasAtras(10), status: "encerrada", usos: 126, receitaGerada: 4890 },
];

export const anunciosMock: Anuncio[] = [
  { id: "an1", titulo: "Hambúrguer de siri no topo", formato: "Destaque na busca", status: "ativo", orcamentoDiario: 20, gasto: 214.6, impressoes: 18420, cliques: 1012, pedidos: 74, inicio: diasAtras(12), fim: diasAFrente(18) },
  { id: "an2", titulo: "Açaí no verão", formato: "Banner na home", status: "pausado", orcamentoDiario: 35, gasto: 140.0, impressoes: 9310, cliques: 388, pedidos: 21, inicio: diasAtras(8), fim: diasAFrente(22) },
  { id: "an3", titulo: "Pratos feitos — almoço", formato: "Vitrine de categoria", status: "encerrado", orcamentoDiario: 15, gasto: 450.0, impressoes: 30120, cliques: 1544, pedidos: 129, inicio: diasAtras(60), fim: diasAtras(30) },
];

export const postsMock: PostFeed[] = [
  { id: "f1", texto: "Chegou o Hambúrguer de siri! 🦀 Siri desfiado, bacon crocante e parmesão. Peça hoje com frete grátis acima de R$ 60.", data: diasAtras(1), curtidas: 184, comentarios: 23, alcance: 3120, imagemCor: "#ffa60c", status: "publicado" },
  { id: "f2", texto: "Terça é dia de açaí com 20% OFF. Monte o seu com Nutella, M&M's e leite em pó.", data: diasAtras(3), curtidas: 96, comentarios: 8, alcance: 1980, imagemCor: "#550076", status: "publicado" },
  { id: "f3", texto: "Novo horário: agora abrimos às 7h com café da manhã. ☕", data: diasAFrente(1), curtidas: 0, comentarios: 0, alcance: 0, imagemCor: "#a36200", status: "agendado" },
];

export const parceriasMock: Parceria[] = [
  { id: "pa1", nome: "Distribuidora Gaúcha", tipo: "Bebidas", descricao: "Refrigerantes e sucos com entrega em 24 h.", beneficio: "8% de desconto em pedidos acima de R$ 500", status: "ativa" },
  { id: "pa2", nome: "EcoPack Sul", tipo: "Embalagens", descricao: "Embalagens biodegradáveis com a sua marca.", beneficio: "Frete grátis e 1º lote com 15% OFF", status: "disponivel" },
  { id: "pa3", nome: "Ceasa POA Direto", tipo: "Fornecedor", descricao: "Hortifrúti do dia direto do produtor.", beneficio: "Preço de atacado sem pedido mínimo", status: "pendente" },
  { id: "pa4", nome: "Banco Tchê", tipo: "Pagamentos", descricao: "Antecipação de recebíveis para parceiros Tasty.", beneficio: "Taxa de 1,49% a.m.", status: "disponivel" },
  { id: "pa5", nome: "Clube Saúde+", tipo: "Benefícios", descricao: "Plano de saúde coletivo para a sua equipe.", beneficio: "A partir de R$ 89 por colaborador", status: "disponivel" },
];
