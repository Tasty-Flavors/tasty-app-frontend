"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Celular: a partir daqui a interface assume o formato de aplicativo. */
export const CONSULTA_CELULAR = "(max-width: 640px)";

export function useMediaQuery(consulta: string) {
  const assinar = useCallback(
    (avisar: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", avisar);
      return () => lista.removeEventListener("change", avisar);
    },
    [consulta],
  );
  return useSyncExternalStore(assinar, () => window.matchMedia(consulta).matches, () => false);
}
