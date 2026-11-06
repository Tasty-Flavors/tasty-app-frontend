#!/usr/bin/env node
/*
 * Roda o Next com um dos ambientes de ambientes/.
 * Uso: node scripts/ambiente.mjs <dev|hml|prod> <dev|build|start> [argumentos do next]
 *
 * Prioridade: variáveis já definidas no shell/CI > <ambiente>.local.env > <ambiente>.env
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const AMBIENTES = ["dev", "hml", "prod"];
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function falhar(mensagem) {
  console.error(`\n[ambiente] ${mensagem}\n`);
  process.exit(1);
}

function lerArquivo(nome) {
  const arquivo = path.join(raiz, "ambientes", nome);
  return existsSync(arquivo) ? parseEnv(readFileSync(arquivo, "utf8")) : {};
}

const [ambiente, comando, ...argumentos] = process.argv.slice(2);
if (!AMBIENTES.includes(ambiente) || !comando) {
  falhar(`Uso: node scripts/ambiente.mjs <${AMBIENTES.join("|")}> <dev|build|start> [argumentos]`);
}

const definidasNoShell = Object.fromEntries(Object.entries(process.env).filter(([chave]) => chave.startsWith("NEXT_PUBLIC_")));
const variaveis = { ...lerArquivo(`${ambiente}.env`), ...lerArquivo(`${ambiente}.local.env`), ...definidasNoShell };

const usaMocks = variaveis.NEXT_PUBLIC_USE_MOCKS !== "false";
const usaLoginFicticio = variaveis.NEXT_PUBLIC_USE_AUTH_MOCKS === "true";
const obrigatorias = [...(usaMocks ? [] : ["NEXT_PUBLIC_API_URL"]), ...(usaLoginFicticio ? [] : ["NEXT_PUBLIC_AUTH_URL"])];
const faltando = obrigatorias.filter((chave) => !variaveis[chave]);
if (faltando.length > 0) falhar(`Ambiente "${ambiente}" precisa de ${faltando.join(" e ")}. Preencha em ambientes/${ambiente}.env.`);

if (ambiente === "prod" && variaveis.NEXT_PUBLIC_ACCESS_TOKEN) {
  console.warn("\n[ambiente] ATENÇÃO: há NEXT_PUBLIC_ACCESS_TOKEN em prod. Ele será embutido no JavaScript público e qualquer visitante poderá lê-lo.\n");
}

console.log(`[ambiente] ${ambiente} | mocks: ${usaMocks ? "ligados" : "desligados"} | BFF: ${variaveis.NEXT_PUBLIC_API_URL || "(não definido)"} | login: ${usaLoginFicticio ? "fictício" : variaveis.NEXT_PUBLIC_AUTH_URL} | token fixo: ${variaveis.NEXT_PUBLIC_ACCESS_TOKEN ? "sim" : "não"}`);

const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const processo = spawn(process.execPath, [next, comando, ...argumentos], { cwd: raiz, stdio: "inherit", env: { ...process.env, ...variaveis } });
for (const sinal of ["SIGINT", "SIGTERM"]) process.on(sinal, () => processo.kill(sinal));
processo.on("exit", (codigo, sinal) => process.exit(sinal ? 1 : (codigo ?? 1)));
