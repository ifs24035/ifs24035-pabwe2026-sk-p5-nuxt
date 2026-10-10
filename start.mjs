/**
 * Preview launcher untuk hasil `nuxt generate` (SPA).
 * Port dibaca dari variabel APP_PORT pada berkas `.env`.
 *
 * Penggunaan:  bun run generate && node start.mjs
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, createReadStream } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = resolve(ROOT, ".output/public");

function readEnvFile(file) {
  const result = {};
  if (!existsSync(file)) return result;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    result[match[1]] = (match[2] ?? "").replace(/^['"]|['"]$/g, "");
  }
  return result;
}

const env = readEnvFile(join(ROOT, ".env"));
const port = Number(env.APP_PORT || process.env.APP_PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

if (!existsSync(PUBLIC_DIR)) {
  console.error("Folder .output/public belum ada. Jalankan `bun run generate` terlebih dahulu.");
  process.exit(1);
}

function resolveFile(urlPath) {
  const safePath = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(PUBLIC_DIR, safePath);

  if (candidate.startsWith(PUBLIC_DIR) && existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }
  // Fallback SPA: seluruh rute dilayani oleh index.html
  return join(PUBLIC_DIR, "index.html");
}

createServer((req, res) => {
  const file = resolveFile(req.url || "/");
  res.writeHead(200, {
    "Content-Type": MIME[extname(file)] || "application/octet-stream",
    "Cache-Control": file.endsWith(".html") ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`\n  Delcom Cash Flow (preview)\n  ➜ Local: http://localhost:${port}/\n`);
});
