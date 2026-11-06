import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type NomeIcone } from "./Icon";

type Variante = "primario" | "secundario" | "marca" | "perigo" | "fantasma";

interface Estilo {
  variante?: Variante;
  pequeno?: boolean;
  bloco?: boolean;
  icone?: NomeIcone;
}

function classes({ variante = "secundario", pequeno, bloco }: Estilo, extra?: string) {
  return ["btn", `btn--${variante}`, pequeno && "btn--p", bloco && "btn--bloco", extra].filter(Boolean).join(" ");
}

export function Button({ variante, pequeno, bloco, icone, className, children, type = "button", ...resto }: Estilo & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variante, pequeno, bloco }, className)} {...resto}>
      {icone && <Icon nome={icone} />}
      {children}
    </button>
  );
}

export function ButtonLink({ variante, pequeno, bloco, icone, className, children, ...resto }: Estilo & ComponentProps<typeof Link>) {
  return (
    <Link className={classes({ variante, pequeno, bloco }, className)} {...resto}>
      {icone && <Icon nome={icone} />}
      {children}
    </Link>
  );
}

/** Botão quadrado só com ícone; o rótulo é obrigatório para leitores de tela. */
export function IconButton({ icone, rotulo, className, ...resto }: { icone: NomeIcone; rotulo: string; children?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={["btn btn--icone", className].filter(Boolean).join(" ")} aria-label={rotulo} title={rotulo} {...resto}>
      <Icon nome={icone} />
    </button>
  );
}
