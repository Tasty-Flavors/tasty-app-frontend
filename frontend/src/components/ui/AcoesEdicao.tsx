import { Button } from "./Button";

/** Par Cancelar e confirmar das edições feitas dentro da própria tela. */
export function AcoesEdicao({ rotulo = "Salvar", desabilitado, onCancelar, onSalvar }: { rotulo?: string; desabilitado?: boolean; onCancelar: () => void; onSalvar: () => void }) {
  return (
    <div className="row">
      <Button pequeno onClick={onCancelar}>Cancelar</Button>
      <Button pequeno variante="primario" disabled={desabilitado} onClick={onSalvar}>{rotulo}</Button>
    </div>
  );
}
