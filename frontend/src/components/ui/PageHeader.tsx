import type { ReactNode } from "react";
import type { Aviso } from "@/lib/useAcao";
import { Toast } from "./Toast";

interface PropsCabecalho {
  titulo: string;
  subtitulo?: ReactNode;
  acoes?: ReactNode;
}

export function PageHeader({ titulo, subtitulo, acoes }: PropsCabecalho) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{titulo}</h1>
        {subtitulo && <p className="page-header__subtitle">{subtitulo}</p>}
      </div>
      {acoes && <div className="row">{acoes}</div>}
    </header>
  );
}

/** Estrutura das telas do painel: cabeçalho, conteúdo e, se a tela tiver ações, o aviso. */
export function Pagina({ aviso, children, ...cabecalho }: PropsCabecalho & { aviso?: Aviso | null; children: ReactNode }) {
  return (
    <div className="stack">
      <PageHeader {...cabecalho} />
      {children}
      {aviso !== undefined && <Toast aviso={aviso} />}
    </div>
  );
}
