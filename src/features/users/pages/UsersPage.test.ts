import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UsersPage from "./UsersPage.vue";
import userApi from "../api/userApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/userApi");

const users = [
  { id: 1, name: "Budi Tobing", email: "budi@del.ac.id", photo: null, created_at: "2024-10-05T11:26:45.000000Z" },
  { id: 2, name: "Sari Dewi", email: "sari@del.ac.id", photo: "http://x.test/sari.png", created_at: "2024-09-01T10:00:00.000000Z" },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userApi.getUsers).mockResolvedValue(users);
  });

  it("menampilkan status memuat lalu daftar pengguna", async () => {
    let resolveRequest!: (value: any) => void;
    vi.mocked(userApi.getUsers).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { wrapper } = renderWithProviders(UsersPage);
    await flushPromises();
    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true);

    resolveRequest(users);
    await flushPromises();

    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="user-count"]').text()).toBe("2 pengguna");
    expect(wrapper.get('[data-testid="user-card-1"]').text()).toContain("Budi Tobing");
    expect(wrapper.get('[data-testid="user-card-1"]').text()).toContain("B");
    expect(wrapper.get('[data-testid="user-card-1"]').find("img").exists()).toBe(false);
    expect(wrapper.get('[data-testid="user-card-2"]').get("img").attributes("src")).toBe("http://x.test/sari.png");
  });

  it("menyaring pengguna berdasarkan nama atau email", async () => {
    const { wrapper } = renderWithProviders(UsersPage);
    await flushPromises();

    await wrapper.get('[data-testid="search-user-input"]').setValue("sari");
    expect(wrapper.get('[data-testid="user-count"]').text()).toBe("1 pengguna");
    expect(wrapper.find('[data-testid="user-card-1"]').exists()).toBe(false);

    await wrapper.get('[data-testid="search-user-input"]').setValue("budi@del");
    expect(wrapper.find('[data-testid="user-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="user-card-2"]').exists()).toBe(false);
  });

  it("menampilkan keadaan kosong jika tidak ada yang cocok", async () => {
    const { wrapper } = renderWithProviders(UsersPage);
    await flushPromises();

    await wrapper.get('[data-testid="search-user-input"]').setValue("tidak-ada");

    expect(wrapper.get('[data-testid="users-empty"]').text()).toContain("Pengguna tidak ditemukan.");
  });

  it("menampilkan keadaan kosong jika API gagal", async () => {
    vi.mocked(userApi.getUsers).mockRejectedValue(new Error("x"));
    const { wrapper } = renderWithProviders(UsersPage);
    await flushPromises();

    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true);
  });
});
