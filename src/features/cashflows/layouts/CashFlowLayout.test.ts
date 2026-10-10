import { describe, it, expect, vi, beforeEach } from "vitest";
import { h } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "../../../app.vue";
import CashFlowLayout from "./CashFlowLayout.vue";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../../users/api/userApi";
import authApi from "../../auth/api/authApi";
import apiHelper from "../../../helpers/apiHelper";

vi.mock("../../users/api/userApi");
vi.mock("../../auth/api/authApi");

const profile = { id: 1, name: "Budi Tobing", email: "ifs24035@del.ac.id", photo: null };

async function mountLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: CashFlowLayout,
        children: [{ path: "", component: { render: () => h("div", { "data-testid": "child-page" }, "Isi halaman") } }],
      },
      { path: "/auth/login", component: { render: () => h("div", "Login") } },
    ],
  });
  await router.push("/");
  await router.isReady();
  const pushSpy = vi.spyOn(router, "push");
  const result = renderWithProviders(App, { router });
  await flushPromises();
  return { ...result, pushSpy };
}

describe("CashFlowLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("mengarahkan ke login jika tidak ada token", async () => {
    const { pushSpy, wrapper } = await mountLayout();

    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
    expect(userApi.getProfile).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Login");
  });

  it("memuat profil dan menampilkan navbar, sidebar, serta isi halaman", async () => {
    apiHelper.putAccessToken("token");
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(profile);
    const { wrapper, pushSpy } = await mountLayout();

    expect(wrapper.get('[data-testid="navbar-name"]').text()).toBe("Budi Tobing");
    expect(wrapper.find('[data-testid="nav-home"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="child-page"]').text()).toBe("Isi halaman");
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("menghapus token dan kembali ke login jika profil gagal dimuat", async () => {
    apiHelper.putAccessToken("token-kedaluwarsa");
    vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error("Unauthenticated"));
    const { pushSpy } = await mountLayout();

    expect(apiHelper.getAccessToken()).toBeNull();
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("membuka dan menutup sidebar dari navbar", async () => {
    apiHelper.putAccessToken("token");
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(profile);
    const { wrapper } = await mountLayout();

    await wrapper.get('[data-testid="toggle-sidebar-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("keluar akun menghapus sesi lalu menuju login", async () => {
    apiHelper.putAccessToken("token");
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(profile);
    vi.mocked(authApi.postLogout).mockResolvedValueOnce("ok");
    const { wrapper, pushSpy, usersStore } = await mountLayout();

    await wrapper.get('[data-testid="logout-button"]').trigger("click");
    await flushPromises();

    expect(authApi.postLogout).toHaveBeenCalled();
    expect(apiHelper.getAccessToken()).toBeNull();
    expect(usersStore.profile).toBeNull();
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
  });
});
