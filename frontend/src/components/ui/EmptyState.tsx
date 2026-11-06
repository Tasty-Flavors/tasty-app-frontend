import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon, type NomeIcone } from "./Icon";

export function EmptyState({ icone = "caixa", titulo, descricao, acao }: { icone?: NomeIcone; titulo: string; descricao?: ReactNode; acao?: ReactNode }) {
  return (
    <div className="empty">
      <Icon nome={icone} />
      <p className="t-title">{titulo}</p>
      {descricao && <p className="t-small">{descricao}</p>}
      {acao}
    </div>
  );
}

/** Estado enquanto os dados não chegaram: carregando ou erro com nova tentativa. */
export function LoadState({ titulo, erro, onTentarNovamente }: { titulo: string; erro: string | null; onTentarNovamente: () => void }) {
  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title">{titulo}</h1>
      </header>
      {erro ? (
        <EmptyState icone="alerta" titulo="Não foi possível carregar" descricao={erro} acao={<Button icone="atualizar" onClick={onTentarNovamente}>Tentar novamente</Button>} />
      ) : (
        <div className="load" role="status">
          Carregando…
        </div>
      )}
    </>
  );
}
