let contexto: AudioContext | null = null;

function obterContexto() {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") return null;
  contexto ??= new AudioContext();
  return contexto;
}

/** O navegador só libera áudio depois de um gesto do usuário; chame em um pointerdown. */
export function desbloquearAudio() {
  void obterContexto()?.resume();
}

/** Dois bipes curtos, sem depender de arquivo de áudio. */
export function tocarAlertaPedido() {
  const ctx = obterContexto();
  if (!ctx || ctx.state !== "running") return;
  [0, 0.22].forEach((atraso) => {
    const inicio = ctx.currentTime + atraso;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.frequency.value = 880;
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.18);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(inicio);
    osc.stop(inicio + 0.2);
  });
}
