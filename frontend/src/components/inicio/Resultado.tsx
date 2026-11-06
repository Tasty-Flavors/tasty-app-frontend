"use client";


export function Resultado({ rotulo, valor, classe }: { rotulo: string; valor: number | string; classe: string }) {
  return (
    <div>
      <span className="t-small">{rotulo}</span>
      <span className={`resultados__valor ${classe}`}>{valor}</span>
    </div>
  );
}
