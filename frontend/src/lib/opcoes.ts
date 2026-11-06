import type { MapaStatus } from "@/components/ui";
import type { Fatura, TipoChavePix } from "@/types";

export const STATUS_FATURA: MapaStatus<Fatura["status"]> = {
  paga: { rotulo: "Paga", tom: "sucesso" },
  aberta: { rotulo: "Aberta", tom: "alerta" },
  atrasada: { rotulo: "Atrasada", tom: "perigo" },
};

export const TIPOS_PIX: TipoChavePix[] = ["Email", "CPF", "CNPJ", "Telefone", "Aleatória"];
