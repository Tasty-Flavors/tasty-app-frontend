import { Fragment, type ReactNode } from "react";

/** Pares de rótulo e valor. */
export function ListaDados({ itens }: { itens: [rotulo: string, valor: ReactNode][] }) {
  return (
    <dl className="dl">
      {itens.map(([rotulo, valor]) => (
        <Fragment key={rotulo}>
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
