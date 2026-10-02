import { useNuxtApp } from "#app";
import type { ISubAccount } from "~/infra/interfaces/services/subAccount";

// Lista compartilhada entre a Sidebar (contador) e a página de sub-contas.
export const useSubAccountsState = () =>
  useState<ISubAccount[]>("sub-accounts", () => []);

export async function loadSubAccounts() {
  const { $httpClient } = useNuxtApp();
  const response = await $httpClient.subAccount.List();
  useSubAccountsState().value = response.result;
  return response.result;
}
