import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import { createAppRouter } from "../../../router";

async function mountAt(path: string, props: Record<string, any> = {}) {
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const result = renderWithProviders(SidebarComponent, { router, props });
  await flushPromises();
  return result;
}

describe("SidebarComponent", () => {
  it("menampilkan tiga menu navigasi", async () => {
    const { wrapper } = await mountAt("/");

    expect(wrapper.get('[data-testid="nav-home"]').text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.get('[data-testid="nav-users"]').text()).toContain("Direktori Pengguna");
    expect(wrapper.get('[data-testid="nav-profile"]').text()).toContain("Profil Saya");
  });

  it("menandai menu beranda aktif hanya pada rute tepat", async () => {
    const home = await mountAt("/");
    expect(home.wrapper.get('[data-testid="nav-home"]').classes()).toContain("bg-ink-900");
    expect(home.wrapper.get('[data-testid="nav-users"]').classes()).not.toContain("bg-ink-900");

    const users = await mountAt("/users");
    expect(users.wrapper.get('[data-testid="nav-home"]').classes()).not.toContain("bg-ink-900");
    expect(users.wrapper.get('[data-testid="nav-users"]').classes()).toContain("bg-ink-900");
  });

  it("menutup sidebar mobile saat menu atau backdrop diklik", async () => {
    const { wrapper, router } = await mountAt("/", { isSidebarOpen: true });

    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.emitted("close-mobile")).toHaveLength(1);

    await wrapper.get('[data-testid="nav-profile"]').trigger("click");
    await flushPromises();
    expect(wrapper.emitted("close-mobile")).toHaveLength(2);
    expect(router.currentRoute.value.path).toBe("/profile");
  });

  it("tidak menampilkan backdrop saat sidebar tertutup", async () => {
    const { wrapper } = await mountAt("/");

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
    expect(wrapper.get("aside").classes()).toContain("-translate-x-full");
  });
});
