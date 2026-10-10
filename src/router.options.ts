import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";

// Nuxt memakai rute kustom dari `src/routes.ts` (bukan file-based routing).
export default {
  routes: () => routes,
} satisfies RouterConfig;
