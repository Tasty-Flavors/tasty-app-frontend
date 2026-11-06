"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface Base {
  rotulo: ReactNode;
  dica?: ReactNode;
  erro?: string;
}

type Props =
  | (Base & { as?: "input" } & InputHTMLAttributes<HTMLInputElement>)
  | (Base & { as: "select" } & SelectHTMLAttributes<HTMLSelectElement>)
  | (Base & { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>);

/** Separa o que é da `Field` do que vai para o controle nativo. */
function atributosNativos<P extends Props>(props: P) {
  const resto: Record<string, unknown> = { ...props };
  for (const chave of ["as", "rotulo", "dica", "erro"]) delete resto[chave];
  resto.className = ["field__control", props.className].filter(Boolean).join(" ");
  return resto as Omit<P, keyof Base | "as">;
}

export function Field(props: Props) {
  const idGerado = useId();
  const id = props.id ?? idGerado;
  const idDica = `${id}-dica`;
  const descricao = props.erro || props.dica;
  const comum = { id, "aria-describedby": descricao ? idDica : undefined, "aria-invalid": props.erro ? true : undefined };

  let controle: ReactNode;
  if (props.as === "select") controle = <select {...atributosNativos(props)} {...comum} />;
  else if (props.as === "textarea") controle = <textarea {...atributosNativos(props)} {...comum} />;
  else controle = <input {...atributosNativos(props)} {...comum} />;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {props.rotulo}
      </label>
      {controle}
      {descricao && (
        <span id={idDica} className={props.erro ? "field__hint t-danger" : "field__hint"}>
          {props.erro || props.dica}
        </span>
      )}
    </div>
  );
}
