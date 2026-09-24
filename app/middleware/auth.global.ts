import { checkAuth } from "~/composable/useAuth";

const publicRoutes = ["/login", "/reset-password"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (publicRoutes.includes(to.path)) return;

  if (!(await checkAuth())) {
    return navigateTo("/login");
  }
});