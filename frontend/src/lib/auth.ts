import { ACCESS_TOKEN, USE_AUTH_MOCKS } from "./config";

const TOKEN_KEY = "accessToken";

/** Falso para JWT vencido ou para o que não é JWT, como um token salvo no modo de demonstração. */
function jwtVigente(token: string) {
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(window.atob(carga)) as { exp?: number };
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/** Token do login feito neste navegador, se ainda valer. */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    return token && (USE_AUTH_MOCKS || jwtVigente(token)) ? token : null;
  } catch {
    return null;
  }
}

/** Token das chamadas ao BFF: o login tem prioridade sobre o token fixo do ambiente. */
export function getToken(): string | null {
  return getStoredToken() ?? ACCESS_TOKEN;
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nada a fazer */
  }
}

export function logout() {
  clearToken();
  window.location.href = "/login";
}
