import type { Aviso } from "@/lib/useAcao";
import { Icon } from "./Icon";

/** Área sempre montada, para leitores de tela anunciarem o aviso quando ele aparece. */
export function Toast({ aviso }: { aviso: Aviso | null }) {
  return (
    <div className="toast-area" role="status" aria-live="polite">
      {aviso && (
        <div className={`toast toast--${aviso.tipo}`}>
          <Icon nome={aviso.tipo === "erro" ? "alerta" : "check"} tamanho={18} />
          {aviso.texto}
        </div>
      )}
    </div>
  );
}
