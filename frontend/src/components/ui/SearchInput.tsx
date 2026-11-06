"use client";

import { Icon } from "./Icon";

export function SearchInput({ valor, onChange, placeholder = "Buscar", rotulo }: { valor: string; onChange: (v: string) => void; placeholder?: string; rotulo?: string }) {
  return (
    <label className="search">
      <Icon nome="busca" />
      <span className="sr-only">{rotulo ?? placeholder}</span>
      <input type="search" value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
