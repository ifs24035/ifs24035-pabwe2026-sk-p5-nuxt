# Delcom Cash Flow — ifs24035-pabwe2026-sk-p5-nuxt

Studi Kasus 2 Praktikum PABWE 2026: aplikasi pencatatan arus kas pribadi
dengan **Nuxt 4 (SPA, `ssr: false`) + TypeScript + Pinia + Tailwind CSS v4**,
memakai REST API `https://open-api.delcom.org/api/v1`.

## Menjalankan

```bash
bun install
bun run dev              # http://localhost:3000 (port dari APP_PORT di .env)
bun run test:coverage    # Vitest + coverage v8 (threshold 100%)
bun run generate         # build SPA statis ke .output/public
node start.mjs           # preview hasil generate (membaca APP_PORT dari .env)
```

## Lingkungan (`.env`)

```
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Struktur

```
src/
├─ app.vue · routes.ts · router.options.ts · router.ts · index.css
├─ helpers/   apiHelper.ts · toolsHelper.ts
├─ hooks/     useInput.ts
└─ features/
   ├─ auth/      api · states · layouts · pages
   ├─ users/     api · states · pages
   ├─ cashflows/ api · states · layouts · components · modals · pages
   └─ common/    pages/NotFoundPage.vue
```
