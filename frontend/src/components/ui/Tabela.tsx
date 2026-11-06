import type { ReactNode } from "react";

export interface Coluna<T> {
  /** Cabeçalho da coluna e rótulo da célula quando a linha vira card no celular. */
  titulo: string;
  celula: (item: T) => ReactNode;
  /** Valor numérico: alinhado à direita. */
  num?: boolean;
  classe?: string | ((item: T) => string | undefined);
  /** Cabeçalho só para leitores de tela (colunas de ações e avisos). */
  oculto?: boolean;
}

interface Props<T> {
  itens: T[];
  colunas: Coluna<T>[];
  /** Mostrado no lugar da tabela quando não há itens. */
  vazio?: ReactNode;
  classeLinha?: (item: T) => string | undefined;
}

/** A primeira coluna vira o título do card no celular; por isso não leva rótulo. */
export function Tabela<T extends { id: string }>({ itens, colunas, vazio, classeLinha }: Props<T>) {
  if (itens.length === 0 && vazio) return <>{vazio}</>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.titulo} className={c.num ? "num" : undefined}>
                {c.oculto ? <span className="sr-only">{c.titulo}</span> : c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id} className={classeLinha?.(item)}>
              {colunas.map((c, i) => {
                const extra = typeof c.classe === "function" ? c.classe(item) : c.classe;
                return (
                  <td key={c.titulo} data-rotulo={i > 0 && !c.oculto ? c.titulo : undefined} className={[c.num && "num", extra].filter(Boolean).join(" ") || undefined}>
                    {c.celula(item)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Título em destaque com uma linha de apoio, comum na primeira coluna. */
export function CelulaTitulo({ titulo, apoio }: { titulo: ReactNode; apoio: ReactNode }) {
  return (
    <>
      <div className="table__strong">{titulo}</div>
      <div className="t-small t-muted">{apoio}</div>
    </>
  );
}
