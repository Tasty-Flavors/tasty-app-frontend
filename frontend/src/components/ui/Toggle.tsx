"use client";

export function Toggle({ ligado, onChange, rotulo, disabled }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string; disabled?: boolean }) {
  return <button type="button" className="toggle" role="switch" aria-checked={ligado} aria-label={rotulo} disabled={disabled} onClick={() => onChange(!ligado)} />;
}
