"use client";

/** Lista de categorias de um filtro, com a opção "Todas" no topo. */
export function FiltroCategoria({ valor, todas, categorias, onChange }: { valor: string; todas: string; categorias: string[]; onChange: (v: string) => void }) {
  return (
    <select className="field__control" aria-label="Filtrar por categoria" value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value={todas}>Todas as categorias</option>
      {categorias.map((c) => <option key={c}>{c}</option>)}
    </select>
  );
}
