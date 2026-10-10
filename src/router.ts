import { createRouter, createWebHistory, type Router, type RouterHistory } from "vue-router";
import { routes } from "./routes";

export { routes };

/** Pabrik router standalone, dipakai oleh test-utils agar rute bisa diuji tanpa Nuxt. */
export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes });
}

/**
 * Riwayat navigasi tanpa listener `pagehide` bawaan vue-router.
 *
 * Listener tersebut memanggil `history.replaceState()` saat halaman ditutup (untuk menyimpan posisi scroll).
 * Perubahan state dari halaman yang sedang masuk ke back/forward cache membuat Chrome mengeluarkannya
 * dari cache ("Internal error: IgnoreEventAndEvict"). Tanpa listener itu halaman bisa masuk bfcache.
 */
export function createBfcacheFriendlyHistory(base?: string): RouterHistory {
  const originalAddEventListener = window.addEventListener;

  window.addEventListener = function (this: Window, type: string, ...rest: unknown[]) {
    if (type === "pagehide") return;
    return (originalAddEventListener as (...args: unknown[]) => void).call(this, type, ...rest);
  } as typeof window.addEventListener;

  try {
    return createWebHistory(base);
  } finally {
    window.addEventListener = originalAddEventListener;
  }
}
