import type { NomeIcone } from "@/components/ui/Icon";

export interface ItemMenu {
  href: string;
  rotulo: string;
  /** PNG de public/assets/icons, ou ícone SVG para os itens novos de Operação. */
  png?: string;
  svg?: NomeIcone;
}

export interface GrupoMenu {
  titulo?: string;
  itens: ItemMenu[];
}

const png = (nome: string) => `/assets/icons/${nome}.png`;

export const MENU: GrupoMenu[] = [
  { itens: [{ href: "/inicio", rotulo: "Início", png: png("pagina-inicial") }] },
  {
    titulo: "Desempenho e vendas",
    itens: [
      { href: "/desempenho", rotulo: "Desempenho", png: png("desempenho") },
      { href: "/pedidos", rotulo: "Pedidos", png: png("pedido") },
      { href: "/financeiro", rotulo: "Financeiro", png: png("sifrao") },
      { href: "/avaliacoes", rotulo: "Avaliações", png: png("estrela") },
      { href: "/premium", rotulo: "Premium", png: png("premium") },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { href: "/entregadores", rotulo: "Entregadores", svg: "moto" },
      { href: "/estoque", rotulo: "Estoque", svg: "caixa" },
      { href: "/precos", rotulo: "Preços", svg: "etiqueta" },
    ],
  },
  {
    titulo: "Marketing",
    itens: [
      { href: "/clientes", rotulo: "Seus Clientes", png: png("pessoas") },
      { href: "/promocoes", rotulo: "Promoções", png: png("promocoes") },
      { href: "/anuncios", rotulo: "Anúncios", png: png("megafone") },
      { href: "/feed", rotulo: "Feed", png: png("feed") },
      { href: "/parcerias", rotulo: "Parcerias", png: png("parceria") },
    ],
  },
  {
    titulo: "Configurações da Loja",
    itens: [
      { href: "/cardapios", rotulo: "Cardápios", png: png("cardapio") },
      { href: "/acessibilidade", rotulo: "Acessibilidade", png: png("acessibilidade") },
      { href: "/privacidade", rotulo: "Privacidade e Segurança", png: png("privacidade") },
      { href: "/dados-da-loja", rotulo: "Dados da Loja", png: png("pessoa") },
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
