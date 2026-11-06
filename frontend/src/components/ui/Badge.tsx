import type { ReactNode } from "react";
import { Icon, type NomeIcone } from "./Icon";

export type TomBadge = "sucesso" | "perigo" | "alerta" | "info" | "neutro" | "marca";
export type MapaStatus<K extends string> = Record<K, { rotulo: string; tom: TomBadge }>;

export function Badge({ tom = "neutro", icone, children }: { tom?: TomBadge; icone?: NomeIcone; children: ReactNode }) {
  return (
    <span className={`badge badge--${tom}`}>
      {icone && <Icon nome={icone} />}
      {children}
    </span>
  );
}

/** Selo de um status a partir do mapa de rótulos e tons da tela. */
export function BadgeStatus<K extends string>({ mapa, valor }: { mapa: MapaStatus<K>; valor: K }) {
  return <Badge tom={mapa[valor].tom}>{mapa[valor].rotulo}</Badge>;
}
