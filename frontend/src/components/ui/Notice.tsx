import type { ReactNode } from "react";
import { Icon, type NomeIcone } from "./Icon";

interface Props {
  tom?: "info" | "perigo";
  icone?: NomeIcone;
  titulo?: ReactNode;
  /** Botão ou link abaixo do texto. */
  acao?: ReactNode;
  role?: "alert";
  className?: string;
  children: ReactNode;
}

export function Notice({ tom, icone = "alerta", titulo, acao, role, className, children }: Props) {
  const texto = titulo ? (
    <div>
      <p className="notice__title">{titulo}</p>
      <p>{children}</p>
    </div>
  ) : (
    <span>{children}</span>
  );
  return (
    <div className={["notice", tom && `notice--${tom}`, className].filter(Boolean).join(" ")} role={role}>
      <Icon nome={icone} />
      {acao ? (
        <div className="stack stack--sm">
          {texto}
          <div>{acao}</div>
        </div>
      ) : (
        texto
      )}
    </div>
  );
}
