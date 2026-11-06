import type { Coordenada, Veiculo } from "@/types";

/*
 * Só para o modo mock: dá à simulação endereços e ruas de verdade. Com o BFF ligado o
 * painel não chama estes serviços; quem localiza a loja e calcula as rotas é o backend.
 * São servidores públicos, gratuitos e sem chave, com política de uso justo (o Nominatim
 * pede no máximo 1 busca por segundo), então não servem para produção.
 */
const URL_ENDERECOS = "https://nominatim.openstreetmap.org/search";
const URL_RUAS = "https://router.project-osrm.org";
const URL_ROTAS = "https://valhalla1.openstreetmap.de/route";
const INTERVALO_BUSCAS_MS = 1100;
const TEMPO_LIMITE_MS = 8000;
const RAIO_BUSCA_GRAUS = 0.05;

const enderecos = new Map<string, Promise<Coordenada | null>>();
const rotas = new Map<string, Promise<RotaCalculada | null>>();
let filaEnderecos: Promise<unknown> = Promise.resolve();

function naFila<T>(tarefa: () => Promise<T>): Promise<T> {
  const resultado = filaEnderecos.then(tarefa);
  filaEnderecos = resultado.catch(() => undefined).then(() => new Promise((fim) => setTimeout(fim, INTERVALO_BUSCAS_MS)));
  return resultado;
}

async function buscarJson<T>(url: string): Promise<T> {
  const resposta = await fetch(url, { signal: AbortSignal.timeout(TEMPO_LIMITE_MS) });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json() as Promise<T>;
}

/** Guarda só as respostas: uma falha de rede pode ser tentada de novo. */
function comCache<T>(cache: Map<string, Promise<T | null>>, chave: string, buscar: () => Promise<T | null>): Promise<T | null> {
  const salvo = cache.get(chave);
  if (salvo) return salvo;
  const promessa = buscar().catch((erro: unknown) => {
    console.warn(`[mock] Serviço de mapas indisponível: ${chave}`, erro);
    cache.delete(chave);
    return null;
  });
  cache.set(chave, promessa);
  return promessa;
}

/** Devolve `null` se o endereço não existir. Com `perto`, só aceita resultados na região desse ponto. */
export function localizarEndereco(endereco: string, perto?: Coordenada): Promise<Coordenada | null> {
  const parametros = new URLSearchParams({ q: endereco, format: "jsonv2", limit: "1", countrycodes: "br" });
  if (perto) {
    const r = RAIO_BUSCA_GRAUS;
    parametros.set("viewbox", `${perto.lng - r},${perto.lat + r},${perto.lng + r},${perto.lat - r}`);
    parametros.set("bounded", "1");
  }
  return comCache(enderecos, parametros.toString(), () =>
    naFila(async () => {
      const [achado] = await buscarJson<{ lat: string; lon: string }[]>(`${URL_ENDERECOS}?${parametros}`);
      return achado ? { lat: Number(achado.lat), lng: Number(achado.lon) } : null;
    }),
  );
}

const paraOsrm = ({ lat, lng }: Coordenada) => `${lng},${lat}`;

/** O ponto de rua mais próximo; sem resposta do serviço, o próprio ponto. */
export async function pontoNaRua(ponto: Coordenada): Promise<Coordenada> {
  try {
    const { waypoints } = await buscarJson<{ waypoints: { location: [number, number] }[] }>(`${URL_RUAS}/nearest/v1/driving/${paraOsrm(ponto)}?number=1`);
    const [lng, lat] = waypoints[0]!.location;
    return { lat, lng };
  } catch {
    return ponto;
  }
}

export interface RotaCalculada {
  pontos: Coordenada[];
  distanciaM: number;
  duracaoS: number;
}

/*
 * O Valhalla escolhe a rota mais rápida para cada veículo. Na bike, `use_hills: 0` pesa as
 * subidas contra a distância: desvia quando existe caminho mais plano, mas não some com a
 * lomba quando o destino fica no alto ou não há alternativa.
 */
const PERFIS: Record<Veiculo, { costing: string; opcoes?: Record<string, unknown> }> = {
  Moto: { costing: "motorcycle" },
  Carro: { costing: "auto" },
  Bike: { costing: "bicycle", opcoes: { use_hills: 0, bicycle_type: "Hybrid" } },
};

/** Formato de linha do Valhalla: pares de latitude e longitude compactados, com 6 casas. */
function decodificarLinha(linha: string): Coordenada[] {
  const pontos: Coordenada[] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  const proximoValor = () => {
    let deslocamento = 0;
    let valor = 0;
    let parte: number;
    do {
      parte = linha.charCodeAt(i++) - 63;
      valor |= (parte & 31) << deslocamento;
      deslocamento += 5;
    } while (parte >= 32);
    return valor & 1 ? ~(valor >> 1) : valor >> 1;
  };
  while (i < linha.length) {
    lat += proximoValor();
    lng += proximoValor();
    pontos.push({ lat: lat / 1e6, lng: lng / 1e6 });
  }
  return pontos;
}

/** A rota mais rápida pelas ruas para o veículo, ou `null` se não houver caminho. */
export function calcularRota(de: Coordenada, para: Coordenada, veiculo: Veiculo): Promise<RotaCalculada | null> {
  const { costing, opcoes } = PERFIS[veiculo];
  const pedido = JSON.stringify({
    locations: [{ lat: de.lat, lon: de.lng }, { lat: para.lat, lon: para.lng }],
    costing,
    costing_options: opcoes ? { [costing]: opcoes } : undefined,
    units: "kilometers",
  });
  return comCache(rotas, pedido, async () => {
    const { trip } = await buscarJson<{ trip?: { summary: { length: number; time: number }; legs: { shape: string }[] } }>(
      `${URL_ROTAS}?json=${encodeURIComponent(pedido)}`,
    );
    if (!trip) return null;
    return { pontos: trip.legs.flatMap((l) => decodificarLinha(l.shape)), distanciaM: trip.summary.length * 1000, duracaoS: trip.summary.time };
  });
}
