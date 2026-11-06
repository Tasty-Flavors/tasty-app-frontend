export interface Restaurante {
  nomeEstabelecimento: string;
  endereco: string;
  descricao: string;
  imagem?: string;
  notaMedia: number;
  totalAvaliacoes: number;
  tempoRetiradaMin: number;
  tempoEntregaMin: number;
  plano: PlanoId;
  /** Ponto do endereço no mapa, resolvido pelo backend. */
  localizacao?: Coordenada;
}

export interface DadosLoja {
  rua: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
  razaoSocial: string;
  cnpj: string;
  chavePix: string;
  tipoChavePix: TipoChavePix;
  telefone: string;
  email: string;
}

export type TipoChavePix = "Email" | "CPF" | "CNPJ" | "Telefone" | "Aleatória";

/* ---------- Pedidos ---------- */
export type StatusPedido = "novo" | "em_preparo" | "pronto" | "em_entrega" | "concluido" | "recusado";
export type TipoPedido = "entrega" | "retirada";

export interface ItemPedido {
  nome: string;
  quantidade: number;
  precoUnitario: number;
  observacao?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  cliente: string;
  telefone: string;
  itens: ItemPedido[];
  taxaEntrega: number;
  total: number;
  status: StatusPedido;
  tipo: TipoPedido;
  pagamento: "PIX" | "Cartão de crédito" | "Cartão de débito" | "Dinheiro";
  criadoEm: string;
  endereco?: string;
  entregadorId?: string;
  observacao?: string;
}

/* ---------- Entregadores ---------- */
export type StatusEntregador = "disponivel" | "em_entrega" | "offline";
export type Veiculo = "Moto" | "Carro" | "Bike";

export interface Coordenada {
  lat: number;
  lng: number;
}

/** `transito` vale para o trecho que começa neste ponto e vai até o seguinte. */
export interface PontoRota extends Coordenada {
  transito?: boolean;
}

export interface Entregador {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  veiculo: Veiculo;
  placa?: string;
  chavePix: string;
  tipoChavePix: TipoChavePix;
  status: StatusEntregador;
  posicao: Coordenada;
  destino?: Coordenada;
  /** Caminho pelas ruas da posição atual até o destino, quando em entrega. */
  rota?: PontoRota[];
  /** Previsão de chegada ao destino (ISO 8601), já considerando o trânsito. */
  chegadaEm?: string;
  pedidoId?: string;
  entregasHoje: number;
  avaliacao: number;
  atualizadoEm: string;
}

/* ---------- Estoque ---------- */
export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: string;
  unidade: "kg" | "g" | "L" | "un" | "cx";
  quantidade: number;
  minimo: number;
  custoUnitario: number;
  validade: string;
  lote: string;
  fornecedor: string;
}

export interface MovimentoEstoque {
  id: string;
  itemId: string;
  tipo: "entrada" | "saida" | "perda";
  quantidade: number;
  data: string;
  motivo: string;
}

/* ---------- Cardápio / Preços ---------- */
export type StatusProduto = "aprovado" | "processando" | "editando" | "pausado";

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  custo: number;
  ativo: boolean;
  status: StatusProduto;
  imagem?: string;
  vendidos30d: number;
}

/* ---------- Marketing ---------- */
export interface Promocao {
  id: string;
  titulo: string;
  tipo: "percentual" | "valor" | "frete_gratis" | "combo";
  valor: number;
  aplicaEm: string;
  inicio: string;
  fim: string;
  status: "ativa" | "agendada" | "encerrada";
  usos: number;
  receitaGerada: number;
}

export interface Anuncio {
  id: string;
  titulo: string;
  formato: "Destaque na busca" | "Banner na home" | "Vitrine de categoria";
  status: "ativo" | "pausado" | "encerrado";
  orcamentoDiario: number;
  gasto: number;
  impressoes: number;
  cliques: number;
  pedidos: number;
  inicio: string;
  fim: string;
}

export interface PostFeed {
  id: string;
  texto: string;
  data: string;
  curtidas: number;
  comentarios: number;
  alcance: number;
  imagemCor: string;
  status: "publicado" | "agendado" | "rascunho";
}

export interface Parceria {
  id: string;
  nome: string;
  tipo: "Fornecedor" | "Bebidas" | "Embalagens" | "Benefícios" | "Pagamentos";
  descricao: string;
  beneficio: string;
  status: "ativa" | "disponivel" | "pendente";
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  pedidos: number;
  totalGasto: number;
  ultimoPedido: string;
  segmento: "Novo" | "Recorrente" | "Fiel" | "Inativo";
  bairro: string;
}

/* ---------- Negócio ---------- */
export interface Avaliacao {
  id: string;
  cliente: string;
  nota: number;
  comentario: string;
  data: string;
  pedidoNumero: number;
  resposta?: string;
  tags: string[];
}

export type PlanoId = "basico" | "pro" | "premium";

export interface Plano {
  id: PlanoId;
  nome: string;
  precoMensal: number;
  comissao: number;
  descricao: string;
  recursos: string[];
  destaque?: boolean;
}

export interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  tipo: "venda" | "taxa" | "repasse" | "estorno";
  valor: number;
  status: "liquidado" | "previsto" | "processando";
}

export interface Fatura {
  id: string;
  competencia: string;
  vencimento: string;
  valor: number;
  status: "paga" | "aberta" | "atrasada";
}

export interface SerieDiaria {
  rotulo: string;
  valor: number;
}

export interface Desempenho {
  faturamento: number;
  faturamentoAnterior: number;
  pedidos: number;
  pedidosAnterior: number;
  ticketMedio: number;
  ticketMedioAnterior: number;
  tempoMedioPreparoMin: number;
  taxaCancelamento: number;
  faturamentoPorDia: SerieDiaria[];
  pedidosPorHora: SerieDiaria[];
  maisVendidos: { nome: string; quantidade: number; receita: number }[];
  canais: { nome: string; pedidos: number }[];
}

/* ---------- Configurações ---------- */
export interface PreferenciasAcessibilidade {
  tutorialVisto: boolean;
  narrador: boolean;
  daltonismo: boolean;
  modoEscuro: boolean;
  alertaSonoro: boolean;
  animacoes: boolean;
}

export interface SessaoAtiva {
  id: string;
  dispositivo: string;
  local: string;
  ultimoAcesso: string;
  atual: boolean;
}

export interface UsuarioEquipe {
  id: string;
  nome: string;
  email: string;
  papel: "Proprietário" | "Gerente" | "Atendente" | "Cozinha";
}
