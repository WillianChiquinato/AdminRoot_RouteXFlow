import { restoreTheme } from "~/composable/useTheme";

export default defineNuxtPlugin((nuxtApp) => {
  // Depois da hidratação, para o estado reativo não divergir do HTML renderizado no servidor.
  nuxtApp.hook("app:mounted", restoreTheme);
});
