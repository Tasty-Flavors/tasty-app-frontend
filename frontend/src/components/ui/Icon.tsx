import type { ReactNode, SVGProps } from "react";

const ICONES = {
  inicio: <><path d="m3 11 9-8 9 8" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
  moto: <><circle cx="5.5" cy="17" r="3.5" /><circle cx="18.5" cy="17" r="3.5" /><path d="M5.5 17h6l4-7h-5" /><path d="M14 5h3l1.5 12" /><path d="M8 10h3" /></>,
  caixa: <><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  etiqueta: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0L3 12Z" /><circle cx="8" cy="8" r="1.4" /></>,
  cifrao: <><path d="M12 2v20" /><path d="M17 6.5C16 5 14.2 4.5 12 4.5c-2.8 0-5 1.3-5 3.7 0 5 10 2.6 10 7.6 0 2.4-2.2 3.7-5 3.7-2.4 0-4.3-.7-5.3-2.3" /></>,
  pin: <><path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13Z" /><circle cx="12" cy="9" r="3" /></>,
  busca: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" /></>,
  filtro: <path d="M3 5h18l-7 8.5V20l-4-2v-4.5L3 5Z" />,
  mais: <path d="M12 5v14M5 12h14" />,
  lapis: <><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m14 8 3 3" /></>,
  lixeira: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="m6 7 1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>,
  alerta: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17.2v.1" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  telefone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2C10.7 21 3 13.3 3 5a2 2 0 0 1 2-2Z" />,
  "seta-baixo": <path d="m6 9 6 6 6-6" />,
  "seta-direita": <path d="m9 6 6 6-6 6" />,
  "seta-esquerda": <path d="m15 6-6 6 6 6" />,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  sino: <><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z" /><path d="M10 21h4" /></>,
  olho: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  "olho-fechado": <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.1A10 10 0 0 1 12 4.8c6.5 0 10 7.2 10 7.2a17 17 0 0 1-3.5 4.4" /><path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7.2 10 7.2c1.5 0 2.8-.4 4-1" /></>,
  opcoes: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  "tendencia-alta": <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  "tendencia-baixa": <><path d="m3 7 6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  estrela: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  cadeado: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></>,
  mensagem: <path d="M4 4h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-5 4v-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />,
  download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 21h16" /></>,
  grade: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  pedidos: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9.5 8h5M9.5 12h5" /></>,
  navegar: <path d="m21 3-7.5 18-2.5-7.5L3.5 11 21 3Z" />,
  atualizar: <><path d="M20 11a8 8 0 0 0-14-4.5L3 9.5" /><path d="M3 4v5.5h5.5" /><path d="M4 13a8 8 0 0 0 14 4.5l3-3" /><path d="M21 20v-5.5h-5.5" /></>,
  cartao: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  coroa: <><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" /><path d="M5 21h14" /></>,
  porcentagem: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></>,
  grafico: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  loja: <><path d="M3 9 5 3h14l2 6" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12v9h14v-9" /><path d="M10 21v-5h4v5" /></>,
  chave: <><circle cx="8" cy="15" r="5" /><path d="m12 11 8.5-8.5" /><path d="m16 7 3 3" /></>,
  dispositivo: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  imagem: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m3 17 5-4 4 3 3-2 6 5" /></>,
  coracao: <path d="M12 20.5s-8.5-5-8.5-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.500 2.500c0 6-8.500 11-8.500 11Z" />,
} satisfies Record<string, ReactNode>;

export type NomeIcone = keyof typeof ICONES;

interface Props extends SVGProps<SVGSVGElement> {
  nome: NomeIcone;
  preenchido?: boolean;
  tamanho?: number;
}

/** Ícones de linha em SVG inline; a cor vem de `currentColor`. */
export function Icon({ nome, preenchido, tamanho = 24, ...resto }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill={preenchido ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...resto}
    >
      {ICONES[nome]}
    </svg>
  );
}
