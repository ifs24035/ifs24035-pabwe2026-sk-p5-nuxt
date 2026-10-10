/**
 * Memindahkan <link rel="stylesheet"> bawaan Nuxt dari <head> ke akhir <body>.
 * Dengan begitu CSS tidak lagi menjadi render-blocking request pada render pertama,
 * sementara kerangka loading (spaLoadingTemplate) sudah bisa tampil lebih dulu.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    const stylesheets: string[] = [];

    html.head = html.head.map((chunk) =>
      chunk.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="\/_nuxt\/[^"]+\.css"[^>]*>/g, (tag) => {
        stylesheets.push(tag);
        return "";
      })
    );

    // Preload di <head> + stylesheet di akhir <body>: permintaan CSS tidak dianggap
    // kritis/render-blocking oleh Lighthouse, tetapi tetap diterapkan sebelum aplikasi dijalankan.
    const preloads = stylesheets.map((tag) => {
      const href = tag.match(/href="([^"]+)"/)?.[1];
      const crossorigin = /\scrossorigin\b/.test(tag) ? " crossorigin" : "";
      return `<link rel="preload" as="style" href="${href}"${crossorigin}>`;
    });

    html.head.unshift(...preloads);
    html.bodyAppend.unshift(...stylesheets);
  });
});
