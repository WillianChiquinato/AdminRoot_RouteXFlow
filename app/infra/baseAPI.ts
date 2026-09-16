import { navigateTo, useRequestHeaders } from "#app";
import { $fetch, type FetchOptions } from "ofetch";
import { clearAuth } from "~/composable/useAuth";

const baseURL = import.meta.env.VITE_API_BASE_URL;
type AuthFetchOptions = FetchOptions<any> & {
  _authRetry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

async function refreshSession() {
  const { $httpClient } = useNuxtApp();

  if (!refreshPromise) {
    refreshPromise = $httpClient.auth.Refresh().then(() => undefined).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

const apiFetch = $fetch.create({
  baseURL,

  onRequest({ options }) {
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (import.meta.server) {
      const cookie = useRequestHeaders(["cookie"]).cookie;
      if (cookie) headers.set("cookie", cookie);
    }

    options.headers = headers;
    options.credentials = "include";
  },

  onResponse({ response }) {
    return response._data;
  },

  onResponseError({ response }) {
    console.error("API Error:", response);
  },
});

export async function fetchInstance<T>(
  request: string,
  options: AuthFetchOptions = {},
): Promise<T> {
  try {
    return await apiFetch<T>(request, options as FetchOptions<"json">);
  } catch (cause: any) {
    const requestUrl = String(request);
    const isAuthRequest = /\/(login|refresh|logout)(?:$|\?)/.test(requestUrl);
    const status = cause?.response?.status ?? cause?.status;

    if (status === 401 && !options._authRetry && !isAuthRequest) {
      try {
        await refreshSession();
        const retryOptions = {
          ...options,
          _authRetry: true,
        } as AuthFetchOptions;
        return await apiFetch<T>(request, retryOptions as FetchOptions<"json">);
      } catch {
        clearAuth();
        await navigateTo("/login");
      }
    }

    if (status === 401) {
      clearAuth();
      await navigateTo("/login");
    }

    throw cause?.response?._data ?? cause;
  }
}