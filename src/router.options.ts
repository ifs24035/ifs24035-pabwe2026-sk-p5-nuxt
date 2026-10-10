import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";
import { createBfcacheFriendlyHistory } from "./router";

// Nuxt memakai rute kustom dari `src/routes.ts` (bukan file-based routing).
export default {
  routes: () => routes,
  history: createBfcacheFriendlyHistory,
} satisfies RouterConfig;
