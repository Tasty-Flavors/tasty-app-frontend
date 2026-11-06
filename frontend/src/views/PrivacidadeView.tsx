"use client";

import { useState } from "react";
import { FormSenha } from "@/components/privacidade/FormSenha";
import { Badge, Button, Card, DrawerAcao, Field, Icon, IconButton, LoadState, Notice, Pagina, Tabela, Toggle } from "@/components/ui";
import { tempoDecorrido } from "@/lib/format";
import { useAcao } from "@/lib/useAcao";
import { useAsync } from "@/lib/useAsync";
import { useFormulario } from "@/lib/useFormulario";
import { adicionarMembroEquipe, alterarPapelMembro, definirDoisFatores, encerrarSessao, listarEquipe, listarSessoes, obterDoisFatores, removerMembroEquipe, solicitarExclusaoDados, solicitarExportacaoDados, trocarSenha } from "@/services/loja";
import type { UsuarioEquipe } from "@/types";

const PAPEIS: UsuarioEquipe["papel"][] = ["Gerente", "Atendente", "Cozinha"];
const PALAVRA_EXCLUSAO = "EXCLUIR";

export function PrivacidadeView() {
  const { data, setData, error, reload } = useAsync(async () => {
    const [sessoes, equipe, doisFatores] = await Promise.all([listarSessoes(), listarEquipe(), obterDoisFatores()]);
    return { sessoes, equipe, doisFatores };
  });
  const { executar, ocupado, aviso } = useAcao();
  const [adicionando, setAdicionando] = useState(false);
  const { form: membro, setForm: setMembro, campo } = useFormulario({ nome: "", email: "", papel: PAPEIS[1]! });
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
    <Pagina titulo="Privacidade e Segurança" subtitulo="Proteja o acesso à conta e controle os seus dados." aviso={aviso}>

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
        <Tabela
          itens={equipe}
          colunas={[
            { titulo: "Nome", classe: "table__strong", celula: (u) => u.nome },
            { titulo: "E-mail", celula: (u) => u.email },
            {
              titulo: "Permissão",
              celula: (u) =>
                u.papel === "Proprietário" ? (
                  <Badge tom="marca">Proprietário</Badge>
                ) : (
                  <select className="field__control field__control--compacto" aria-label={`Permissão de ${u.nome}`} value={u.papel} disabled={ocupado} onChange={(e) => mudarPapel(u.id, e.target.value as UsuarioEquipe["papel"])}>
                    {PAPEIS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                ),
            },
            { titulo: "Ações", oculto: true, celula: (u) => u.papel !== "Proprietário" && <IconButton icone="lixeira" rotulo={`Remover ${u.nome}`} disabled={ocupado} onClick={() => removerMembro(u.id)} /> },
          ]}
        />
      </Card>

      <DrawerAcao aberto={adicionando} titulo="Adicionar à equipe" rotuloConfirmar="Adicionar" ocupado={ocupado} confirmarDesabilitado={!membro.nome.trim() || !membro.email.includes("@")} onCancelar={() => setAdicionando(false)} onConfirmar={salvarMembro}>
        <Field rotulo="Nome" {...campo("nome")} />
        <Field rotulo="E-mail" type="email" {...campo("email")} />
        <Field as="select" rotulo="Permissão" {...campo("papel")}>
          {PAPEIS.map((p) => <option key={p}>{p}</option>)}
        </Field>
      </DrawerAcao>

      <DrawerAcao
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
        <Notice tom="perigo">Esta ação é definitiva: cardápio, pedidos e histórico financeiro serão apagados.</Notice>
        <Field rotulo={`Digite ${PALAVRA_EXCLUSAO} para confirmar`} value={confirmacaoExclusao} onChange={(e) => setConfirmacaoExclusao(e.target.value)} />
      </DrawerAcao>
    </Pagina>
  );
}
