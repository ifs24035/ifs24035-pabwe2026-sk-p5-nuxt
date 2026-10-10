import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import App from "../../../app.vue";
import { renderWithProviders } from "../../../test-utils";
import { createAppRouter } from "../../../router";
import apiHelper from "../../../helpers/apiHelper";

vi.mock("../api/authApi");

async function mountAt(path: string) {
  const router = createAppRouter(createMemoryHistory());
  const pushSpy = vi.spyOn(router, "push");
  await router.push(path);
  await router.isReady();
  pushSpy.mockClear();
  pushSpy.mockResolvedValue(undefined);
  const result = renderWithProviders(App, { router });
  await flushPromises();
  return { ...result, pushSpy };
}

describe("AuthLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("menandai tab Masuk aktif pada rute login", async () => {
    const { wrapper, pushSpy } = await mountAt("/auth/login");

    expect(wrapper.text()).toContain("Selamat datang kembali");
    expect(wrapper.get('[data-testid="tab-login"]').classes()).toContain("bg-white");
    expect(wrapper.get('[data-testid="tab-register"]').classes()).not.toContain("bg-white");
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("menandai tab Buat akun aktif pada rute register", async () => {
    const { wrapper } = await mountAt("/auth/register");

    expect(wrapper.text()).toContain("Mulai mencatat arus kas");
    expect(wrapper.get('[data-testid="tab-register"]').classes()).toContain("bg-white");
    expect(wrapper.get('[data-testid="tab-login"]').classes()).not.toContain("bg-white");
  });

  it("mengarahkan ke dashboard jika token sudah tersimpan", async () => {
    apiHelper.putAccessToken("token-aktif");
    const { pushSpy } = await mountAt("/auth/login");

    expect(pushSpy).toHaveBeenCalledWith("/");
  });
});
