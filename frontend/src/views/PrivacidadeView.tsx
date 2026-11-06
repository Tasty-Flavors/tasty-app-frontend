"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confirmacao, Drawer } from "@/components/ui/Drawer";
import { LoadState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { tempoDecorrido } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import {
  adicionarMembroEquipe, alterarPapelMembro, definirDoisFatores, encerrarSessao, listarEquipe, listarSessoes, obterDoisFatores, removerMembroEquipe,
  solicitarExclusaoDados, solicitarExportacaoDados, trocarSenha,
} from "@/services/loja";
import type { UsuarioEquipe } from "@/types";

const PAPEIS: UsuarioEquipe["papel"][] = ["Gerente", "Atendente", "Cozinha"];
const TAMANHO_MINIMO_SENHA = 8;
const PALAVRA_EXCLUSAO = "EXCLUIR";

function FormSenha({ onSalvar, ocupado }: { onSalvar: (atual: string, nova: string) => Promise<boolean>; ocupado: boolean }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const erroNova = nova && nova.length < TAMANHO_MINIMO_SENHA ? `Use ao menos ${TAMANHO_MINIMO_SENHA} caracteres` : undefined;
  const erroConfirmar = confirmar && confirmar !== nova ? "As senhas não conferem" : undefined;
  const valido = atual && nova.length >= TAMANHO_MINIMO_SENHA && confirmar === nova;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valido) return;
    if (await onSalvar(atual, nova)) {
      setAtual("");
      setNova("");
      setConfirmar("");
    }
  }

  return (
    <Card titulo="Trocar senha">
      <form className="form-edicao" onSubmit={enviar}>
        <Field rotulo="Senha atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} />
        <Field rotulo="Nova senha" type="password" autoComplete="new-password" erro={erroNova} value={nova} onChange={(e) => setNova(e.target.value)} />
        <Field rotulo="Confirmar nova senha" type="password" autoComplete="new-password" erro={erroConfirmar} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        <div>
          <Button type="submit" variante="primario" icone="chave" disabled={ocupado || !valido}>Trocar senha</Button>
        </div>
      </form>
    </Card>
  );
}

export function PrivacidadeView() {
  const { data, setData, error, reload } = useAsync(async () => {
    const [sessoes, equipe, doisFatores] = await Promise.all([listarSessoes(), listarEquipe(), obterDoisFatores()]);
    return { sessoes, equipe, doisFatores };
  });
  const { executar, ocupado, aviso } = useAcao();
  const [adicionando, setAdicionando] = useState(false);
  const [membro, setMembro] = useState({ nome: "", email: "", papel: PAPEIS[1]! });
  const [excluindo, setExcluindo] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");

  if (!data) return <LoadState titulo="Privacidade e Segurança" erro={error} onTentarNovamente={reload} />;
  const { sessoes, equipe, doisFatores } = data;

  const salvarSenha = async (atual: string, nova: string) => (await executar(() => trocarSenha(atual, nova), "Senha alterada")) !== undefined;

  async function alternar2fa(ativo: boolean) {
    const r = await executar(() => definirDoisFatores(ativo), ativo ? "Verificação em duas etapas ativada" : "Verificação em duas etapas desativada");
    if (r !== undefined) setData((d) => (d ? { ...d, doisFatores: r } : d));
  }

  async function encerrar(id: string) {
    const r = await executar(() => encerrarSessao(id), "Sessão encerrada");
    if (r) setData((d) => (d ? { ...d, sessoes: r } : d));
  }

  async function salvarMembro() {
    const r = await executar(() => adicionarMembroEquipe({ ...membro, nome: membro.nome.trim(), email: membro.email.trim() }), "Pessoa adicionada à equipe");
    if (!r) return;
    setData((d) => (d ? { ...d, equipe: r } : d));
    setMembro({ nome: "", email: "", papel: PAPEIS[1]! });
    setAdicionando(false);
  }

  async function mudarPapel(id: string, papel: UsuarioEquipe["papel"]) {
    const r = await executar(() => alterarPapelMembro(id, papel), "Permissão atualizada");
    if (r) setData((d) => (d ? { ...d, equipe: r } : d));
  }

  async function removerMembro(id: string) {
    const r = await executar(() => removerMembroEquipe(id), "Pessoa removida da equipe");
    if (r) setData((d) => (d ? { ...d, equipe: r } : d));
  }

  async function confirmarExclusao() {
    await executar(solicitarExclusaoDados, "Solicitação de exclusão registrada");
    setExcluindo(false);
    setConfirmacaoExclusao("");
  }

  return (
    <div className="stack">
      <PageHeader titulo="Privacidade e Segurança" subtitulo="Proteja o acesso à conta e controle os seus dados." />

      <div className="grid grid--2">
        <FormSenha onSalvar={salvarSenha} ocupado={ocupado} />
        <div className="stack">
          <Card titulo="Verificação em duas etapas">
            <div className="linha-opcao">
              <p className="t-small t-muted">Pede um código além da senha ao entrar em um dispositivo novo.</p>
              <Toggle ligado={doisFatores} disabled={ocupado} rotulo="Verificação em duas etapas" onChange={alternar2fa} />
            </div>
          </Card>
          <Card titulo="Seus dados">
            <div className="stack stack--sm">
              <p className="t-small t-muted">Exporte uma cópia dos dados da loja ou peça a exclusão definitiva.</p>
              <div className="row">
                <Button icone="download" disabled={ocupado} onClick={() => executar(solicitarExportacaoDados, "Exportação solicitada: enviaremos o arquivo por e-mail")}>Exportar dados</Button>
                <Button variante="perigo" icone="lixeira" onClick={() => setExcluindo(true)}>Excluir dados</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card titulo="Sessões ativas">
        <ul className="lista-simples">
          {sessoes.map((s) => (
            <li key={s.id}>
              <div className="row min-0">
                <Icon nome="dispositivo" />
                <div className="min-0">
                  <div className="t-title">{s.dispositivo}</div>
                  <div className="t-small t-muted">{s.local} · {tempoDecorrido(s.ultimoAcesso)}</div>
                </div>
              </div>
              {s.atual ? <Badge tom="sucesso" icone="check">Esta sessão</Badge> : <Button pequeno disabled={ocupado} onClick={() => encerrar(s.id)}>Encerrar</Button>}
            </li>
          ))}
        </ul>
      </Card>

      <Card semPadding titulo="Equipe e permissões" acao={<Button pequeno icone="mais" onClick={() => setAdicionando(true)}>Adicionar</Button>}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Permissão</th>
                <th><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {equipe.map((u) => (
                <tr key={u.id}>
                  <td className="table__strong">{u.nome}</td>
                  <td data-rotulo="E-mail">{u.email}</td>
                  <td data-rotulo="Permissão">
                    {u.papel === "Proprietário" ? (
                      <Badge tom="marca">Proprietário</Badge>
                    ) : (
                      <select className="field__control field__control--compacto" aria-label={`Permissão de ${u.nome}`} value={u.papel} disabled={ocupado} onChange={(e) => mudarPapel(u.id, e.target.value as UsuarioEquipe["papel"])}>
                        {PAPEIS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    )}
                  </td>
                  <td>{u.papel !== "Proprietário" && <IconButton icone="lixeira" rotulo={`Remover ${u.nome}`} disabled={ocupado} onClick={() => removerMembro(u.id)} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        aberto={adicionando}
        titulo="Adicionar à equipe"
        onFechar={() => setAdicionando(false)}
        rodape={
          <>
            <Button onClick={() => setAdicionando(false)}>Cancelar</Button>
            <Button variante="primario" disabled={ocupado || !membro.nome.trim() || !membro.email.includes("@")} onClick={salvarMembro}>Adicionar</Button>
          </>
        }
      >
        <Field rotulo="Nome" value={membro.nome} onChange={(e) => setMembro({ ...membro, nome: e.target.value })} />
        <Field rotulo="E-mail" type="email" value={membro.email} onChange={(e) => setMembro({ ...membro, email: e.target.value })} />
        <Field as="select" rotulo="Permissão" value={membro.papel} onChange={(e) => setMembro({ ...membro, papel: e.target.value as UsuarioEquipe["papel"] })}>
          {PAPEIS.map((p) => <option key={p}>{p}</option>)}
        </Field>
      </Drawer>

      <Confirmacao
        aberto={excluindo}
        titulo="Excluir dados da loja"
        rotuloConfirmar="Solicitar exclusão"
        perigo
        ocupado={ocupado}
        confirmarDesabilitado={confirmacaoExclusao !== PALAVRA_EXCLUSAO}
        onCancelar={() => {
          setExcluindo(false);
          setConfirmacaoExclusao("");
        }}
        onConfirmar={confirmarExclusao}
      >
        <div className="notice notice--perigo">
          <Icon nome="alerta" />
          <span>Esta ação é definitiva: cardápio, pedidos e histórico financeiro serão apagados.</span>
        </div>
        <Field rotulo={`Digite ${PALAVRA_EXCLUSAO} para confirmar`} value={confirmacaoExclusao} onChange={(e) => setConfirmacaoExclusao(e.target.value)} />
      </Confirmacao>
      <Toast aviso={aviso} />
    </div>
  );
}
