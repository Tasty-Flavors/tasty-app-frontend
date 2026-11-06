"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { temAlerta } from "@/lib/estoque";
import { tocarAlertaPedido } from "@/lib/som";
import { usePolling } from "@/lib/usePolling";
import { lerPreferencias } from "@/services/loja";
import { listarEstoque, listarPedidos } from "@/services/operacao";

const INTERVALO_PEDIDOS_MS = 10_000;

/**
 * Observa o painel inteiro: conta os selos do menu e toca o alerta sonoro
 * quando chega um pedido novo, em qualquer tela (se a preferência estiver ligada).
 */
export function useAlertasPainel(pathname: string, ativo: boolean) {
  const [pedidosNovos, setPedidosNovos] = useState(0);
  const [alertasEstoque, setAlertasEstoque] = useState(0);
  const conhecidos = useRef<Set<string> | null>(null);

  const verificarPedidos = useCallback(async () => {
    const novos = (await listarPedidos()).filter((p) => p.status === "novo");
    setPedidosNovos(novos.length);
    const anteriores = conhecidos.current;
    conhecidos.current = new Set(novos.map((p) => p.id));
    // Na primeira leitura tudo é "novo": só alerta do que chegar depois dela.
    if (anteriores && novos.some((p) => !anteriores.has(p.id)) && lerPreferencias().alertaSonoro) tocarAlertaPedido();
  }, []);

  usePolling(verificarPedidos, INTERVALO_PEDIDOS_MS, ativo);

  useEffect(() => {
    if (!ativo) return;
    verificarPedidos().catch(() => undefined);
    listarEstoque()
      .then((itens) => setAlertasEstoque(itens.filter(temAlerta).length))
      .catch(() => undefined);
    // A cada troca de tela os selos são atualizados.
  }, [ativo, pathname, verificarPedidos]);

  return { pedidosNovos, alertasEstoque };
}
