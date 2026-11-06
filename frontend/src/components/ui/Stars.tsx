import { Icon } from "./Icon";

const ESTRELAS = [1, 2, 3, 4, 5];

/** A camada preenchida é recortada na proporção da nota: 4,5 mostra quatro estrelas e meia. */
export function Stars({ nota, pequeno }: { nota: number; pequeno?: boolean }) {
  const preenchido = (Math.min(5, Math.max(0, nota)) / 5) * 100;
  return (
    <span className={pequeno ? "stars stars--p" : "stars"} role="img" aria-label={`Nota ${nota.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5`}>
      {ESTRELAS.map((n) => (
        <Icon key={n} nome="estrela" />
      ))}
      <span className="stars__cheias" style={{ width: `${preenchido}%` }}>
        {ESTRELAS.map((n) => (
          <Icon key={n} nome="estrela-cheia" />
        ))}
      </span>
    </span>
  );
}
