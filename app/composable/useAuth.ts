import { useNuxtApp } from "#app";
import type { IAuth } from "~/infra/interfaces/services/auth";

const authUser = () => useState<IAuth | null>("auth-user", () => null);

export function getLoggedUser() {
  return authUser().value;
}

export function setLoggedUser(user: IAuth | null) {
  authUser().value = user;
}

export function clearAuth() {
  setLoggedUser(null);
}

export async function checkAuth() {
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.auth.Me();
    setLoggedUser(response.result.user);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export async function logout() {
  try {
    const { $httpClient } = useNuxtApp();
    await $httpClient.auth.Logout();
  } finally {
    clearAuth();
  }
}