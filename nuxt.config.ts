import tailwindcss from "@tailwindcss/vite";

const DEFAULT_BASEURL = "https://open-api.delcom.org/api/v1";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  // Aplikasi berjalan sebagai SPA, seluruh kode berada di dalam folder `src/`
  ssr: false,
  srcDir: "src/",

  // Routing dikendalikan oleh `src/router.options.ts` -> `src/routes.ts`
  pages: true,

  // Kerangka loading statis di HTML awal agar halaman langsung tampil sebelum JavaScript siap
  spaLoadingTemplate: true,

  devtools: { enabled: false },

  // Tanpa app manifest: aplikasi tidak perlu mengunduh file builds/latest.json dan builds/meta/*.json
  // saat dibuka, sehingga rantai permintaan jaringan lebih pendek.
  experimental: {
    appManifest: false,
  },

  // Halaman utama dibuat sebagai berkas HTML statis agar langsung dilayani CDN (tanpa serverless function).
  nitro: {
    prerender: {
      routes: ["/", "/auth/login", "/auth/register", "/users", "/profile"],
      crawlLinks: false,
      failOnError: false,
    },
  },
  modules: ["@pinia/nuxt"],
  css: ["~/index.css"],

  devServer: {
    port: Number(process.env.APP_PORT) || 3000,
  },

  vite: {
    plugins: [tailwindcss()],
    build: { target: "esnext" },
    define: {
      // Konstanta global yang dideklarasikan pada `src/env.d.ts`
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL || DEFAULT_BASEURL),
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "id" },
      title: "Delcom Cash Flow",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Catat, pantau, dan pahami aliran uang pribadi Anda dalam satu tempat.",
        },
        { name: "theme-color", content: "#141d32" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
      ],
      // Google Fonts dimuat setelah halaman selesai tampil, agar tidak berebut bandwidth dengan JavaScript awal.
      script: [
        {
          innerHTML: `(function(){function f(){var l=document.createElement("link");l.rel="stylesheet";l.href="${FONT_URL}";document.head.appendChild(l);}function r(){(window.requestIdleCallback||function(c){setTimeout(c,1)})(f);}if(document.readyState==="complete"){r();}else{window.addEventListener("load",r);}})();`,
          tagPosition: "head",
        },
      ],
    },
  },
});
