"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toggle } from "@/components/ui/Toggle";
import { desbloquearAudio, tocarAlertaPedido } from "@/lib/som";
import { usePreferencias } from "@/lib/usePreferencias";

export function AcessibilidadeView() {
  const { prefs, atualizar } = usePreferencias();

  const opcoes = [
    { rotulo: "Tutorial", descricao: "Mostra a orientação de primeiros passos na tela Início.", ligado: !prefs.tutorialVisto, alterar: (v: boolean) => atualizar({ tutorialVisto: !v }) },
    { rotulo: "Narrador de tela", descricao: "Lê em voz alta a tela aberta e o elemento em foco.", ligado: prefs.narrador, alterar: (v: boolean) => atualizar({ narrador: v }) },
    { rotulo: "Modo daltonismo", descricao: "Troca verde e vermelho por azul e laranja.", ligado: prefs.daltonismo, alterar: (v: boolean) => atualizar({ daltonismo: v }) },
    { rotulo: "Modo escuro", descricao: "Usa fundos escuros em todo o painel.", ligado: prefs.modoEscuro, alterar: (v: boolean) => atualizar({ modoEscuro: v }) },
    { rotulo: "Alerta sonoro de pedido", descricao: "Toca um aviso quando chega um pedido novo.", ligado: prefs.alertaSonoro, alterar: (v: boolean) => atualizar({ alertaSonoro: v }) },
    { rotulo: "Animações de tela", descricao: "Mantém transições e movimentos da interface.", ligado: prefs.animacoes, alterar: (v: boolean) => atualizar({ animacoes: v }) },
  ];

  return (
    <div className="stack">
      <PageHeader titulo="Acessibilidade" subtitulo="As opções são aplicadas e salvas neste navegador na hora." />
      <Card>
        {opcoes.map((o) => (
          <div key={o.rotulo} className="linha-opcao">
            <div>
              <div className="kpi__label">{o.rotulo}</div>
              <div className="t-small t-muted">{o.descricao}</div>
            </div>
            <Toggle ligado={o.ligado} rotulo={o.rotulo} onChange={o.alterar} />
          </div>
        ))}
      </Card>
      <div>
        <Button
          icone="sino"
          onClick={() => {
            desbloquearAudio();
            setTimeout(tocarAlertaPedido, 50);
          }}
        >
          Testar alerta sonoro
        </Button>
      </div>
    </div>
  );
}
