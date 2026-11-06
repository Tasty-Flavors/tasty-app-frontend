const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

/** BFF do painel (mesmos endereços do frontend legado). */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocal ? "http://localhost:8081/tasty-app-bff" : "https://tasty-app-bff.fly.dev/tasty-app-bff");

/** Serviço de autenticação. */
export const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  (isLocal ? "http://localhost:8085/tasty-auth-service" : "https://tasty-auth-service.fly.dev/tasty-auth-service");

/**
 * Quando verdadeiro, os serviços em src/services devolvem os dados de src/mocks
 * em vez de chamar o BFF. Padrão: ligado, até os endpoints existirem.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
