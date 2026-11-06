/** Barra de nível. O valor visível vem do texto ao lado, por isso é escondida de leitores de tela. */
export function Progresso({ percentual, tom }: { percentual: number; tom?: "perigo" | "sucesso" }) {
  return (
    <div className="progress" aria-hidden="true">
      <div className={tom ? `progress__bar progress__bar--${tom}` : "progress__bar"} style={{ width: `${percentual}%` }} />
    </div>
  );
}
