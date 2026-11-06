"use client";

import { useCallback, useEffect, useState } from "react";

export interface Aviso {
  texto: string;
  tipo: "sucesso" | "erro";
}

/** Executa uma ação de serviço, com estado de "ocupado" e aviso de sucesso ou erro. */
export function useAcao() {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(id);
  }, [aviso]);

  /** Devolve `undefined` se a ação falhar; o erro já vira aviso na tela. */
  const executar = useCallback(async <T,>(acao: () => Promise<T>, sucesso?: string): Promise<T | undefined> => {
    setOcupado(true);
    try {
      const resultado = await acao();
      if (sucesso) setAviso({ texto: sucesso, tipo: "sucesso" });
      return resultado;
    } catch (e) {
      setAviso({ texto: e instanceof Error ? e.message : "Não foi possível concluir a ação", tipo: "erro" });
      return undefined;
    } finally {
      setOcupado(false);
    }
  }, []);

  return { executar, ocupado, aviso, setAviso };
}
