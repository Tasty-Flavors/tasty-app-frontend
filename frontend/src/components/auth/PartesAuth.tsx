"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { VERSAO_APP } from "@/lib/config";

interface PropsSenha {
  id: string;
  rotulo: string;
  autoComplete: string;
  valor: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function CampoSenha({ id, rotulo, autoComplete, valor, onChange }: PropsSenha) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {rotulo}
      </label>
      <div className="login__password">
        <input id={id} className="field__control" type={visivel ? "text" : "password"} autoComplete={autoComplete} placeholder={rotulo} required value={valor} onChange={onChange} />
        <button type="button" aria-label={visivel ? `Esconder ${rotulo.toLowerCase()}` : `Mostrar ${rotulo.toLowerCase()}`} onClick={() => setVisivel((v) => !v)}>
          <Icon nome={visivel ? "olho-fechado" : "olho"} />
        </button>
      </div>
    </div>
  );
}

export function BotoesSociais({ onClicar }: { onClicar: () => void }) {
  return (
    <div className="login__social">
      <Button onClick={onClicar}>
        <svg viewBox="-3 0 262 262" aria-hidden="true">
          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
        </svg>
        Entrar com Google
      </Button>
      <Button onClick={onClicar}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.710 19.500c-.830 1.240-1.710 2.450-3.050 2.470-1.340.030-1.770-.790-3.290-.790-1.530 0-2 .770-3.270.820-1.310.050-2.300-1.320-3.140-2.530C4.250 17 2.940 12.450 4.700 9.390c.870-1.520 2.430-2.480 4.120-2.510 1.280-.020 2.500.870 3.290.870.780 0 2.260-1.070 3.810-.910.650.030 2.470.260 3.640 1.980-.090.060-2.170 1.280-2.150 3.810.030 3.020 2.650 4.030 2.680 4.040-.030.070-.420 1.440-1.380 2.830ZM13 3.500c.730-.830 1.940-1.460 2.940-1.500.130 1.170-.340 2.350-1.040 3.190-.690.850-1.830 1.510-2.950 1.420-.150-1.150.410-2.350 1.050-3.110Z" />
        </svg>
        Entrar com Apple
      </Button>
    </div>
  );
}

/** No celular fica no pé da tela de entrada. */
export function VersaoApp() {
  return <p className="login__versao">{VERSAO_APP}</p>;
}
