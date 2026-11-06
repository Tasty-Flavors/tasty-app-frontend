/*
 * Valores de ambientes/<dev|hml|prod>.env, aplicados por scripts/ambiente.mjs.
 * O Next embute NEXT_PUBLIC_* no build: trocar de ambiente exige reiniciar ou
 * refazer o build. Não há valor padrão de URL de propósito, para um ambiente mal
 * configurado nunca chamar outro por engano.
 */

/** BFF do painel. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Serviço de autenticação. */
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? "";

/** Token fixo do ambiente, usado quando não há login salvo no navegador. */
export const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN || null;

/** Quando verdadeiro, os serviços de src/services devolvem os dados de src/mocks. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/** Quando verdadeiro, login e cadastro são fictícios e não chamam o serviço de autenticação. */
export const USE_AUTH_MOCKS = process.env.NEXT_PUBLIC_USE_AUTH_MOCKS === "true";

/** Versão exibida nas telas de entrada do celular. */
export const VERSAO_APP = "V1 - 11.09.2026";
