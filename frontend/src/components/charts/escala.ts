/** Maior valor "redondo" (1, 2, 2,5, 5 × 10ⁿ) que contém `maximo`, dividido em `divisoes` marcas. */
export function marcasEixo(maximo: number, divisoes = 4) {
  if (maximo <= 0) return [0, 1];
  const bruto = maximo / divisoes;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto) ?? bruto;
  const marcas: number[] = [];
  for (let i = 0; i <= Math.ceil(maximo / passo); i++) marcas.push(Math.round(i * passo * 1e6) / 1e6);
  return marcas;
}

/** Eixo curto: 2.000 fica por extenso; a partir de 10 mil vira "10 mil". */
export function rotuloEixo(v: number) {
  return v >= 10000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : v.toLocaleString("pt-BR");
}

/** Quantos rótulos do eixo X pular para não colidirem. */
export function passoRotulos(total: number, maximoVisivel = 12) {
  return Math.max(1, Math.ceil(total / maximoVisivel));
}
