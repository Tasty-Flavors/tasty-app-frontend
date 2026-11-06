"use client";

import { useEffect, useRef } from "react";

/** Chama `fn` a cada `ms`, pausando com a aba oculta. Falhas são ignoradas até a próxima volta. */
export function usePolling(fn: () => Promise<unknown> | void, ms: number, ativo = true) {
  const atual = useRef(fn);
  useEffect(() => {
    atual.current = fn;
  });

  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      void Promise.resolve()
        .then(() => atual.current())
        .catch(() => undefined);
    }, ms);
    return () => clearInterval(id);
  }, [ms, ativo]);
}
