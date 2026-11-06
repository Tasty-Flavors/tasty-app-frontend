import type { ReactNode } from "react";

export function PageHeader({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: ReactNode; acoes?: ReactNode }) {
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
