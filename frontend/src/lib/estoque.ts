import type { ItemEstoque } from "@/types";
import { diasAte } from "./format";

export const DIAS_ALERTA_VALIDADE = 3;

export type SituacaoValidade = "vencido" | "hoje" | "proximo" | "ok";

export function situacaoValidade(validade: string): { situacao: SituacaoValidade; dias: number; rotulo: string } {
  const dias = diasAte(validade);
  if (dias < 0) return { situacao: "vencido", dias, rotulo: "Vencido" };
  if (dias === 0) return { situacao: "hoje", dias, rotulo: "Vence hoje" };
  if (dias <= DIAS_ALERTA_VALIDADE) return { situacao: "proximo", dias, rotulo: `Vence em ${dias} ${dias === 1 ? "dia" : "dias"}` };
  return { situacao: "ok", dias, rotulo: "Ok" };
}

export const abaixoDoMinimo = (i: ItemEstoque) => i.quantidade < i.minimo;
export const estaVencido = (i: ItemEstoque) => situacaoValidade(i.validade).situacao === "vencido";
export const venceEmBreve = (i: ItemEstoque) => {
  const { situacao } = situacaoValidade(i.validade);
  return situacao === "hoje" || situacao === "proximo";
};
export const temAlerta = (i: ItemEstoque) => abaixoDoMinimo(i) || estaVencido(i) || venceEmBreve(i);
