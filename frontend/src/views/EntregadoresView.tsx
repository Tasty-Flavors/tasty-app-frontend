"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { FORM_VAZIO, FormCadastro } from "@/components/entregadores/FormCadastro";
import { ItemFrota } from "@/components/entregadores/ItemFrota";
import { Button, Card, DrawerAcao, EmptyState, IconButton, LoadState, Pagina, Tabela, Toggle } from "@/components/ui";
import { USE_MOCKS } from "@/lib/config";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePolling } from "@/lib/usePolling";
import { alterarDisponibilidade, cadastrarEntregador, listarEntregadores, listarPedidos, obterPosicaoLoja, obterPosicoes, removerEntregador } from "@/services/operacao";
import type { Entregador } from "@/types";

const INTERVALO_POSICOES_MS = 2000;

/* O Leaflet usa `window` e pesa: entra só nesta rota e só no navegador. */
const MapaEntregadores = dynamic(() => import("@/components/mapa/MapaEntregadores").then((m) => m.MapaEntregadores), {
  ssr: false,
  loading: () => <div className="mapa mapa--carregando" role="status">Carregando mapa…</div>,
});

export function EntregadoresView() {
  const { data, setData, error, reload } = useAsync(async () => {
    // Sem a localização, o mapa ainda mostra a frota: não derruba a tela.
    const loja = await obterPosicaoLoja().catch(() => null);
    const [entregadores, pedidos] = await Promise.all([listarEntregadores(), listarPedidos()]);
    return { entregadores, pedidos, loja };
  });
  const { executar, ocupado, aviso } = useAcao();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [cadastrando, setCadastrando] = useState(false);
  const [remover, setRemover] = useState<Entregador | null>(null);
  const versao = useRef(0);

  usePolling(async () => {
    const inicio = versao.current;
    const posicoes = await obterPosicoes();
    if (inicio !== versao.current) return;
    const porId = new Map(posicoes.map((p) => [p.id, p]));
    setData((d) => (d ? { ...d, entregadores: d.entregadores.map((e) => {
      const lida = porId.get(e.id);
      // Campos ausentes na leitura significam fim da rota, não "manter a anterior".
      return lida ? { ...e, destino: undefined, rota: undefined, chegadaEm: undefined, ...lida } : e;
    }) } : d));
  }, INTERVALO_POSICOES_MS);

  if (!data) return <LoadState titulo="Entregadores" erro={error} onTentarNovamente={reload} />;
  const { entregadores, pedidos, loja } = data;

  const atualizarLista = (lista: Entregador[]) => {
    versao.current += 1;
    setData((d) => (d ? { ...d, entregadores: lista } : d));
  };

  async function salvar(form: typeof FORM_VAZIO) {
    const novo = await executar(
      () => cadastrarEntregador({ ...form, placa: form.veiculo === "Bike" ? undefined : form.placa }),
      `${form.nome} cadastrado(a)`,
    );
    if (!novo) return;
    atualizarLista([...entregadores, novo]);
    setCadastrando(false);
  }

  async function alternar(e: Entregador, online: boolean) {
    const lista = await executar(() => alterarDisponibilidade(e.id, online ? "disponivel" : "offline"));
    if (lista) atualizarLista(lista);
  }

  async function confirmarRemocao() {
    if (!remover) return;
    const alvo = remover;
    const ok = await executar(() => removerEntregador(alvo.id), `${alvo.nome} removido(a)`);
    setRemover(null);
    if (ok) atualizarLista(entregadores.filter((e) => e.id !== alvo.id));
  }

  return (
    <Pagina titulo="Entregadores" subtitulo="Acompanhe sua frota no mapa e gerencie os cadastros." acoes={<Button variante="primario" icone="mais" onClick={() => setCadastrando(true)}>Cadastrar entregador</Button>} aviso={aviso}>

      <div className="grid grid--sidebar">
        <Card titulo="Área de entrega" subtitulo="Posições atualizadas a cada 2 segundos">
          {!loja && <p className="t-small t-muted">Não foi possível localizar a loja no mapa. Confira o endereço cadastrado em Dados da loja.</p>}
          <MapaEntregadores entregadores={entregadores} loja={loja} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} />
          <div className="mapa-legenda">
            <span><i className="mapa-legenda__loja" />Loja</span>
            <span><i className="mapa-legenda__em_entrega" />Em entrega</span>
            <span><i className="mapa-legenda__disponivel" />Disponível</span>
            <span><i className="mapa-legenda__transito" />{USE_MOCKS ? "Trânsito (simulado)" : "Trânsito"}</span>
          </div>
        </Card>
        <Card titulo="Frota agora">
          {entregadores.length === 0 ? (
            <EmptyState icone="moto" titulo="Nenhum entregador cadastrado" />
          ) : (
            entregadores.map((e) => (
              <ItemFrota key={e.id} entregador={e} pedido={pedidos.find((p) => p.id === e.pedidoId)} selecionado={selecionadoId === e.id} onSelecionar={() => setSelecionadoId(e.id)} />
            ))
          )}
        </Card>
      </div>

      <Card semPadding titulo="Entregadores cadastrados">
        <Tabela
          itens={entregadores}
          colunas={[
            { titulo: "Nome", classe: "table__strong", celula: (e) => e.nome },
            { titulo: "CPF", celula: (e) => e.cpf },
            { titulo: "Veículo", celula: (e) => e.veiculo },
            { titulo: "Placa", celula: (e) => e.placa ?? "—" },
            { titulo: "Chave PIX", celula: (e) => e.chavePix },
            { titulo: "Tipo", celula: (e) => e.tipoChavePix },
            { titulo: "Online", celula: (e) => <Toggle ligado={e.status !== "offline"} disabled={e.status === "em_entrega" || ocupado} rotulo={`${e.nome} online`} onChange={(v) => alternar(e, v)} /> },
            { titulo: "Ações", oculto: true, celula: (e) => <IconButton icone="lixeira" rotulo={`Remover ${e.nome}`} disabled={e.status === "em_entrega"} onClick={() => setRemover(e)} /> },
          ]}
        />
      </Card>

      <FormCadastro aberto={cadastrando} ocupado={ocupado} onFechar={() => setCadastrando(false)} onSalvar={salvar} />
      <DrawerAcao aberto={Boolean(remover)} titulo="Remover entregador" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>O cadastro de {remover?.nome} será removido. Esta ação não pode ser desfeita.</p>
      </DrawerAcao>
    </Pagina>
  );
}
