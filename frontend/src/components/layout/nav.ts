import type { NomeIcone } from "@/components/ui/Icon";

export interface ItemMenu {
  href: string;
  rotulo: string;
  icone: NomeIcone;
}

export interface GrupoMenu {
  titulo?: string;
  itens: ItemMenu[];
}

export const MENU: GrupoMenu[] = [
  { itens: [{ href: "/inicio", rotulo: "Início", icone: "inicio" }] },
  {
    titulo: "Desempenho e vendas",
    itens: [
      { href: "/desempenho", rotulo: "Desempenho", icone: "grafico" },
      { href: "/pedidos", rotulo: "Pedidos", icone: "pedidos" },
      { href: "/financeiro", rotulo: "Financeiro", icone: "cifrao" },
      { href: "/avaliacoes", rotulo: "Avaliações", icone: "estrela" },
      { href: "/premium", rotulo: "Premium", icone: "coroa" },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { href: "/entregadores", rotulo: "Entregadores", icone: "moto" },
      { href: "/estoque", rotulo: "Estoque", icone: "caixa" },
      { href: "/precos", rotulo: "Preços", icone: "etiqueta" },
    ],
  },
  {
    titulo: "Marketing",
    itens: [
      { href: "/clientes", rotulo: "Seus Clientes", icone: "pessoas" },
      { href: "/promocoes", rotulo: "Promoções", icone: "porcentagem" },
      { href: "/anuncios", rotulo: "Anúncios", icone: "megafone" },
      { href: "/feed", rotulo: "Feed", icone: "feed" },
      { href: "/parcerias", rotulo: "Parcerias", icone: "parceria" },
    ],
  },
  {
    titulo: "Configurações da Loja",
    itens: [
      { href: "/cardapios", rotulo: "Cardápios", icone: "cardapio" },
      { href: "/acessibilidade", rotulo: "Acessibilidade", icone: "acessibilidade" },
      { href: "/privacidade", rotulo: "Privacidade e Segurança", icone: "escudo" },
      { href: "/dados-da-loja", rotulo: "Dados da Loja", icone: "loja" },
    ],
  },
];

export function tituloDaRota(pathname: string) {
  for (const grupo of MENU) {
    const item = grupo.itens.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
    if (item) return item.rotulo;
  }
  return "Tasty";
}

export const estaAtivo = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
