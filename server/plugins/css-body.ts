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

    html.bodyAppend.unshift(...stylesheets);
  });
});
