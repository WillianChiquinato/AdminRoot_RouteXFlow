import { useNuxtApp } from "#app";
import type { IUserPreferences, IUserProfile } from "~/infra/interfaces/services/user";
import { usePreferencesStore } from "~/infra/store/preferencesStore";
import { resetTheme } from "~/composable/useTheme";

const authUser = () => useState<IUserProfile | null>("auth-user", () => null);

export function getLoggedUser() {
  return authUser().value;
}

export function setLoggedUser(user: IUserProfile | null) {
  authUser().value = user;
}

export function setPreferences(preferences: IUserPreferences | null) {
  usePreferencesStore().setPreferences(preferences);
}

export function clearAuth() {
  setLoggedUser(null);
  setPreferences(null);
  // O tema escuro vale só durante a sessão: sem login, volta ao claro.
  resetTheme();
}

export async function checkAuth() {
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.auth.Me();
    setLoggedUser(response.result.user);
    setPreferences(response.result.preferences);
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
