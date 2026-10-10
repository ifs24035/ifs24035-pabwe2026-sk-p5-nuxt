import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import App from "./app.vue";
import { renderWithProviders } from "./test-utils";
import { createAppRouter } from "./router";

describe("App", () => {
  it("dirender tanpa error", () => {
    const { wrapper } = renderWithProviders(App);
    expect(wrapper.exists()).toBe(true);
  });

  it("menampilkan NotFoundPage untuk rute yang tidak dikenal", async () => {
    const router = createAppRouter(createMemoryHistory());
    await router.push("/rute-tidak-ada");
    await router.isReady();

    const { wrapper } = renderWithProviders(App, { router });
    await flushPromises();

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
  });
});
