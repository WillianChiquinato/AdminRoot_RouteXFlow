import { checkAuth } from "~/composable/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;

  if (!(await checkAuth())) {
    return navigateTo("/login");
  }
});