"use client";

import { useState } from "react";
import { CartaoPlano } from "@/components/premium/CartaoPlano";
import { DrawerAcao, ListaDados, LoadState, Pagina } from "@/components/ui";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { listarPlanos, trocarPlano } from "@/services/negocio";
import type { Plano } from "@/types";

export function PremiumView() {
  const { data, setData, error, reload } = useAsync(listarPlanos);
  const { executar, ocupado, aviso } = useAcao();
  const [escolhido, setEscolhido] = useState<Plano | null>(null);

  if (!data) return <LoadState titulo="Premium" erro={error} onTentarNovamente={reload} />;

  async function confirmar() {
    if (!escolhido) return;
    const alvo = escolhido;
    const r = await executar(() => trocarPlano(alvo.id), `Plano alterado para ${alvo.nome}`);
    if (r) setData(r);
    setEscolhido(null);
  }

  return (
    <Pagina titulo="Premium" subtitulo="Compare os planos e escolha o melhor para a sua loja." aviso={aviso}>
      <div className="grid grid--3">
        {data.planos.map((plano) => (
          <CartaoPlano key={plano.id} plano={plano} atual={plano.id === data.atual} onEscolher={() => setEscolhido(plano)} />
        ))}
      </div>
      <DrawerAcao aberto={Boolean(escolhido)} titulo={`Mudar para o plano ${escolhido?.nome ?? ""}`} rotuloConfirmar="Confirmar troca" ocupado={ocupado} onCancelar={() => setEscolhido(null)} onConfirmar={confirmar}>
        {escolhido && (
          <ListaDados
            itens={[
              ["Mensalidade", escolhido.precoMensal === 0 ? "Sem mensalidade" : formatarMoeda(escolhido.precoMensal)],
              ["Comissão", `${formatarPercentual(escolhido.comissao)} por pedido`],
            ]}
          />
        )}
      </DrawerAcao>
    </Pagina>
  );
}
