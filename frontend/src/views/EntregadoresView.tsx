"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confirmacao, Drawer } from "@/components/ui/Drawer";
import { EmptyState, LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { iniciais, mascaraCpf, mascaraTelefone, tempoDecorrido } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { usePolling } from "@/lib/usePolling";
import {
  alterarDisponibilidade, cadastrarEntregador, listarEntregadores, listarPedidos, obterPosicoes, posicaoLoja, removerEntregador,
} from "@/services/operacao";
import type { Entregador, StatusEntregador, TipoChavePix, Veiculo } from "@/types";

const MAPA_L = 1000;
const MAPA_A = 640;
const INTERVALO_POSICOES_MS = 2000;
const RUAS_V = [90, 230, 370, 510, 650, 790, 930];
const RUAS_H = [80, 200, 320, 440, 560];
const LARGURA_RUA = 14;

const STATUS: Record<StatusEntregador, { rotulo: string; tom: "sucesso" | "marca" | "neutro" }> = {
  disponivel: { rotulo: "Disponível", tom: "sucesso" },
  em_entrega: { rotulo: "Em entrega", tom: "marca" },
  offline: { rotulo: "Offline", tom: "neutro" },
};

const TIPOS_PIX: TipoChavePix[] = ["Email", "CPF", "CNPJ", "Telefone", "Aleatória"];
const VEICULOS: Veiculo[] = ["Moto", "Carro", "Bike"];

/** Quadras do mapa: o espaço entre as ruas, com um parque e o rio para dar referência. */
function FundoMapa() {
  const xs = [0, ...RUAS_V, MAPA_L];
  const ys = [0, ...RUAS_H, MAPA_A];
  const quadras = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x = xs[i]! + (i === 0 ? 0 : LARGURA_RUA / 2);
      const y = ys[j]! + (j === 0 ? 0 : LARGURA_RUA / 2);
      const w = xs[i + 1]! - x - (i === xs.length - 2 ? 0 : LARGURA_RUA / 2);
      const h = ys[j + 1]! - y - (j === ys.length - 2 ? 0 : LARGURA_RUA / 2);
      const parque = i === 5 && j === 1;
      quadras.push(<rect key={`${i}-${j}`} x={x} y={y} width={w} height={h} rx={4} className={parque ? "mapa__parque" : "mapa__quadra"} />);
    }
  }
  return (
    <>
      {quadras}
      <path className="mapa__rio" d="M0 0H70C60 120 40 260 52 400 60 500 40 580 30 640H0Z" />
      <text className="mapa__texto" x={14} y={30}>Guaíba</text>
      <text className="mapa__texto" x={720} y={146} textAnchor="middle">Parque</text>
    </>
  );
}

function Mapa({ entregadores, selecionadoId, onSelecionar }: { entregadores: Entregador[]; selecionadoId: string | null; onSelecionar: (id: string) => void }) {
  const lojaX = posicaoLoja.x * MAPA_L;
  const lojaY = posicaoLoja.y * MAPA_A;
  const visiveis = entregadores.filter((e) => e.status !== "offline");
  const emEntrega = visiveis.filter((e) => e.status === "em_entrega").length;
  return (
    <svg
      className="mapa"
      viewBox={`0 0 ${MAPA_L} ${MAPA_A}`}
      role="img"
      aria-label={`Mapa da área de entrega com a loja no centro: ${visiveis.length} entregadores ativos, ${emEntrega} em entrega. A lista ao lado traz os mesmos dados em texto.`}
    >
      <FundoMapa />
      <circle className="mapa__area" cx={lojaX} cy={lojaY} r={270} />
      {visiveis.map((e) =>
        e.destino && e.status === "em_entrega" ? (
          <g key={`rota-${e.id}`}>
            <line className="mapa__rota" x1={e.posicao.x * MAPA_L} y1={e.posicao.y * MAPA_A} x2={e.destino.x * MAPA_L} y2={e.destino.y * MAPA_A} />
            <circle className="mapa__destino" cx={e.destino.x * MAPA_L} cy={e.destino.y * MAPA_A} r={6} />
          </g>
        ) : null,
      )}
      <g transform={`translate(${lojaX} ${lojaY})`}>
        <circle className="mapa__loja" r={22} />
        <g transform="translate(-13 -13)" className="mapa__icone-loja">
          <Icon nome="loja" width={26} height={26} />
        </g>
      </g>
      {visiveis.map((e) => (
        <g
          key={e.id}
          className="mapa__entregador"
          style={{ transform: `translate(${e.posicao.x * MAPA_L}px, ${e.posicao.y * MAPA_A}px)` }}
          onClick={() => onSelecionar(e.id)}
        >
          {selecionadoId === e.id && <circle className="mapa__selecao" r={25} />}
          <circle className={`mapa__ponto mapa__ponto--${e.status}`} r={19} />
          <text className="mapa__iniciais" textAnchor="middle" y={6}>{iniciais(e.nome)}</text>
        </g>
      ))}
    </svg>
  );
}

const FORM_VAZIO = { nome: "", cpf: "", telefone: "", veiculo: "Moto" as Veiculo, placa: "", chavePix: "", tipoChavePix: "Email" as TipoChavePix };

function FormCadastro({ aberto, ocupado, onFechar, onSalvar }: { aberto: boolean; ocupado: boolean; onFechar: () => void; onSalvar: (f: typeof FORM_VAZIO) => void }) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [tentou, setTentou] = useState(false);
  const campo = <K extends keyof typeof FORM_VAZIO>(k: K, v: (typeof FORM_VAZIO)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const exigePlaca = form.veiculo !== "Bike";
  const erros = {
    nome: !form.nome.trim() ? "Informe o nome" : undefined,
    cpf: form.cpf.replace(/\D/g, "").length !== 11 ? "CPF deve ter 11 dígitos" : undefined,
    telefone: form.telefone.replace(/\D/g, "").length < 10 ? "Telefone incompleto" : undefined,
    placa: exigePlaca && !form.placa.trim() ? "Informe a placa" : undefined,
    chavePix: !form.chavePix.trim() ? "Informe a chave PIX" : undefined,
  };
  const valido = !Object.values(erros).some(Boolean);

  function salvar() {
    setTentou(true);
    if (!valido) return;
    onSalvar(form);
    setForm(FORM_VAZIO);
    setTentou(false);
  }

  return (
    <Drawer
      aberto={aberto}
      titulo="Cadastrar entregador"
      onFechar={onFechar}
      rodape={
        <>
          <Button onClick={onFechar}>Cancelar</Button>
          <Button variante="primario" disabled={ocupado} onClick={salvar}>Salvar</Button>
        </>
      }
    >
      <Field rotulo="Nome" value={form.nome} erro={tentou ? erros.nome : undefined} onChange={(e) => campo("nome", e.target.value)} />
      <Field rotulo="CPF" inputMode="numeric" value={form.cpf} erro={tentou ? erros.cpf : undefined} onChange={(e) => campo("cpf", mascaraCpf(e.target.value))} />
      <Field rotulo="Telefone" inputMode="tel" value={form.telefone} erro={tentou ? erros.telefone : undefined} onChange={(e) => campo("telefone", mascaraTelefone(e.target.value))} />
      <Field as="select" rotulo="Veículo" value={form.veiculo} onChange={(e) => campo("veiculo", e.target.value as Veiculo)}>
        {VEICULOS.map((v) => <option key={v}>{v}</option>)}
      </Field>
      {exigePlaca && <Field rotulo="Placa" value={form.placa} erro={tentou ? erros.placa : undefined} onChange={(e) => campo("placa", e.target.value.toUpperCase())} />}
      <Field as="select" rotulo="Tipo da chave PIX" value={form.tipoChavePix} onChange={(e) => campo("tipoChavePix", e.target.value as TipoChavePix)}>
        {TIPOS_PIX.map((t) => <option key={t}>{t}</option>)}
      </Field>
      <Field rotulo="Chave PIX" value={form.chavePix} erro={tentou ? erros.chavePix : undefined} onChange={(e) => campo("chavePix", e.target.value)} />
    </Drawer>
  );
}

export function EntregadoresView() {
  const { data, setData, error, reload } = useAsync(async () => {
    const [entregadores, pedidos] = await Promise.all([listarEntregadores(), listarPedidos()]);
    return { entregadores, pedidos };
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
    setData((d) => (d ? { ...d, entregadores: d.entregadores.map((e) => ({ ...e, ...porId.get(e.id) })) } : d));
  }, INTERVALO_POSICOES_MS);

  if (!data) return <LoadState titulo="Entregadores" erro={error} onTentarNovamente={reload} />;
  const { entregadores, pedidos } = data;

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
    <div className="stack">
      <PageHeader titulo="Entregadores" subtitulo="Acompanhe sua frota no mapa e gerencie os cadastros." acoes={<Button variante="primario" icone="mais" onClick={() => setCadastrando(true)}>Cadastrar entregador</Button>} />

      <div className="grid grid--sidebar">
        <Card titulo="Área de entrega" subtitulo="Posições atualizadas a cada 2 segundos">
          <Mapa entregadores={entregadores} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId} />
          <div className="mapa-legenda">
            <span><i className="mapa-legenda__loja" />Loja</span>
            <span><i className="mapa-legenda__em_entrega" />Em entrega</span>
            <span><i className="mapa-legenda__disponivel" />Disponível</span>
          </div>
        </Card>
        <Card titulo="Frota agora">
          {entregadores.length === 0 ? (
            <EmptyState icone="moto" titulo="Nenhum entregador cadastrado" />
          ) : (
            entregadores.map((e) => {
              const pedido = pedidos.find((p) => p.id === e.pedidoId);
              return (
                <button key={e.id} type="button" className="entregador-item" aria-pressed={selecionadoId === e.id} onClick={() => setSelecionadoId(e.id)}>
                  <Avatar nome={e.nome} />
                  <span className="min-0 stack--flex">
                    <span className="row row--between">
                      <span className="t-title">{e.nome}</span>
                      <Badge tom={STATUS[e.status].tom}>{STATUS[e.status].rotulo}</Badge>
                    </span>
                    <span className="t-small t-muted">
                      {pedido ? `Pedido #${pedido.numero}` : "Sem pedido em curso"} · {e.entregasHoje} entregas hoje · ★ {e.avaliacao.toLocaleString("pt-BR")}
                    </span>
                    <span className="t-small t-muted">Atualizado {tempoDecorrido(e.atualizadoEm)}</span>
                  </span>
                </button>
              );
            })
          )}
        </Card>
      </div>

      <Card semPadding titulo="Entregadores cadastrados">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Veículo</th>
                <th>Placa</th>
                <th>Chave PIX</th>
                <th>Tipo</th>
                <th>Online</th>
                <th><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {entregadores.map((e) => (
                <tr key={e.id}>
                  <td className="table__strong">{e.nome}</td>
                  <td>{e.cpf}</td>
                  <td>{e.veiculo}</td>
                  <td>{e.placa ?? "—"}</td>
                  <td>{e.chavePix}</td>
                  <td>{e.tipoChavePix}</td>
                  <td>
                    <Toggle ligado={e.status !== "offline"} disabled={e.status === "em_entrega" || ocupado} rotulo={`${e.nome} online`} onChange={(v) => alternar(e, v)} />
                  </td>
                  <td>
                    <IconButton icone="lixeira" rotulo={`Remover ${e.nome}`} disabled={e.status === "em_entrega"} onClick={() => setRemover(e)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <FormCadastro aberto={cadastrando} ocupado={ocupado} onFechar={() => setCadastrando(false)} onSalvar={salvar} />
      <Confirmacao aberto={Boolean(remover)} titulo="Remover entregador" rotuloConfirmar="Remover" perigo ocupado={ocupado} onCancelar={() => setRemover(null)} onConfirmar={confirmarRemocao}>
        <p>O cadastro de {remover?.nome} será removido. Esta ação não pode ser desfeita.</p>
      </Confirmacao>
      <Toast aviso={aviso} />
    </div>
  );
}
