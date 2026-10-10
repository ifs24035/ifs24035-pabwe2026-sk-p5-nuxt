import { createRouter, createWebHistory, type Router, type RouterHistory } from "vue-router";
import { routes } from "./routes";

export { routes };

/** Pabrik router standalone, dipakai oleh test-utils agar rute bisa diuji tanpa Nuxt. */
export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes });
}
