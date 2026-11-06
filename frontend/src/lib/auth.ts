import { ACCESS_TOKEN } from "./config";

const TOKEN_KEY = "accessToken";

/** Token do login feito neste navegador. */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
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
