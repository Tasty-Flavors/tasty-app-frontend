import type { ReactNode } from "react";

interface Props {
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  acao?: ReactNode;
  semPadding?: boolean;
  plano?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Card({ titulo, subtitulo, acao, semPadding, plano, className, children }: Props) {
  const classes = ["card", semPadding && "card--sem-padding", plano && "card--plano", className].filter(Boolean).join(" ");
  return (
    <section className={classes}>
      {(titulo || acao) && (
        <header className={semPadding ? "card__header card__header--padding" : "card__header"}>
          <div>
            {titulo && <h2 className="card__title">{titulo}</h2>}
            {subtitulo && <p className="card__subtitle">{subtitulo}</p>}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}
