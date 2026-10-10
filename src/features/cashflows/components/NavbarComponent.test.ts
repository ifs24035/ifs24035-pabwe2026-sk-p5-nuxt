import { describe, it, expect } from "vitest";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

const profile = { id: 1, name: "Budi Tobing", email: "ifs24035@del.ac.id", photo: null };

describe("NavbarComponent", () => {
  it("menampilkan nama, username, dan status sesi pengguna", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, { props: { profile } });

    expect(wrapper.get('[data-testid="navbar-name"]').text()).toBe("Budi Tobing");
    expect(wrapper.get('[data-testid="navbar-username"]').text()).toBe("@ifs24035");
    expect(wrapper.get('[data-testid="navbar-session"]').text()).toContain("Sesi aktif");
    expect(wrapper.get('[data-testid="navbar-user"]').text()).toContain("B");
    expect(wrapper.find("img[alt='Budi Tobing']").exists()).toBe(false);
  });

  it("menampilkan foto profil jika tersedia", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: { ...profile, photo: "http://x.test/foto.png" } },
    });

    expect(wrapper.get("img[alt='Budi Tobing']").attributes("src")).toBe("http://x.test/foto.png");
  });

  it("aman dipakai tanpa profil", () => {
    const { wrapper } = renderWithProviders(NavbarComponent);

    expect(wrapper.get('[data-testid="navbar-user"]').text()).toContain("U");
    expect(wrapper.get('[data-testid="navbar-username"]').text()).toBe("@");
  });

  it("memancarkan event logout dan toggle-sidebar", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, { props: { profile } });

    await wrapper.get('[data-testid="logout-button"]').trigger("click");
    await wrapper.get('[data-testid="toggle-sidebar-btn"]').trigger("click");

    expect(wrapper.emitted("logout")).toHaveLength(1);
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("mengganti ikon menu saat sidebar terbuka", () => {
    const closed = renderWithProviders(NavbarComponent, { props: { profile, isSidebarOpen: false } });
    const open = renderWithProviders(NavbarComponent, { props: { profile, isSidebarOpen: true } });

    expect(closed.wrapper.find(".lucide-menu").exists()).toBe(true);
    expect(open.wrapper.find(".lucide-x").exists()).toBe(true);
  });
});
