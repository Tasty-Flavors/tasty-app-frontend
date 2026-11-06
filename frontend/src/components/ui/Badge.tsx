import type { ReactNode } from "react";
import { Icon, type NomeIcone } from "./Icon";

export type TomBadge = "sucesso" | "perigo" | "alerta" | "info" | "neutro" | "marca";

export function Badge({ tom = "neutro", icone, children }: { tom?: TomBadge; icone?: NomeIcone; children: ReactNode }) {
  return (
    <span className={`badge badge--${tom}`}>
      {icone && <Icon nome={icone} />}
      {children}
    </span>
  );
}
