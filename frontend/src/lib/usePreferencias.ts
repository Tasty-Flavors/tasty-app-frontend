"use client";

import { useCallback, useEffect, useState } from "react";
import { acessibilidadeMock } from "@/mocks/loja";
import { EVENTO_PREFERENCIAS, lerPreferencias, salvarPreferencias } from "@/services/loja";
import type { PreferenciasAcessibilidade } from "@/types";

/** Preferências salvas no navegador, sincronizadas entre os componentes abertos. */
export function usePreferencias() {
  const [prefs, setPrefs] = useState<PreferenciasAcessibilidade>(acessibilidadeMock);

  useEffect(() => {
    const ler = () => setPrefs(lerPreferencias());
    ler();
    window.addEventListener(EVENTO_PREFERENCIAS, ler);
    return () => window.removeEventListener(EVENTO_PREFERENCIAS, ler);
  }, []);

  const atualizar = useCallback((campos: Partial<PreferenciasAcessibilidade>) => {
    salvarPreferencias({ ...lerPreferencias(), ...campos });
  }, []);

  return { prefs, atualizar };
}
