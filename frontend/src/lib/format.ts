const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR");
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const formatarMoeda = (v: number) => brl.format(v);
export const formatarNumero = (v: number) => num.format(v);
export const formatarPercentual = (v: number) => pct.format(v);

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatarDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const minutosAte = (iso: string, agora: number) => Math.ceil((new Date(iso).getTime() - agora) / 60000);

/** "4 min"; passou do horário previsto, "chegando". */
export function tempoAteChegada(iso: string, agora = Date.now()) {
  const min = minutosAte(iso, agora);
  return min > 0 ? `${min} min` : "chegando";
}

/** "Chega em 4 min (14:32)"; passou do horário previsto, "Chegando". */
export function previsaoDeChegada(iso: string, agora = Date.now()) {
  return minutosAte(iso, agora) > 0 ? `Chega em ${tempoAteChegada(iso, agora)} (${formatarHora(iso)})` : "Chegando";
}

/** "há 5 min", "há 2 h" — usado nos cards de pedidos. */
export function tempoDecorrido(iso: string, agora = Date.now()) {
  const min = Math.max(0, Math.round((agora - new Date(iso).getTime()) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
}

/** Dias inteiros entre hoje e a data (negativo = já passou). */
export function diasAte(iso: string, agora = new Date()) {
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  const d = new Date(iso);
  const alvo = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((alvo - hoje) / 86400000);
}

export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const soDigitos = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

export function mascaraCpf(v: string) {
  return soDigitos(v, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraCnpj(v: string) {
  return soDigitos(v, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascaraCep(v: string) {
  return soDigitos(v, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export function mascaraTelefone(v: string) {
  const d = soDigitos(v, 11);
  const meio = d.length > 10 ? 7 : 6;
  if (d.length <= 2) return d;
  if (d.length <= meio) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
}

/** Converte "AAAA-MM-DD" de um input de data para ISO no fuso local. */
export function dataLocalParaIso(valor: string) {
  return new Date(`${valor}T12:00:00`).toISOString();
}

/** Data de hoje (ou daqui a N dias) no formato de um input de data. */
export function dataParaInput(diasAFrente = 0) {
  const d = new Date(Date.now() + diasAFrente * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
