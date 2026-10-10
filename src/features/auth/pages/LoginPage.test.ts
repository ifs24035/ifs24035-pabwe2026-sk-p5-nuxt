import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import authApi from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import apiHelper from "../../../helpers/apiHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

async function fillAndSubmit(wrapper: ReturnType<typeof renderWithProviders>["wrapper"]) {
  await wrapper.get('[data-testid="login-email-input"]').setValue("budi@del.org");
  await wrapper.get('[data-testid="login-password-input"]').setValue("rahasia");
  await wrapper.get("form").trigger("submit");
}

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("menampilkan formulir login", () => {
    const { wrapper } = renderWithProviders(LoginPage);

    expect(wrapper.text()).toContain("Selamat datang kembali");
    expect(wrapper.find('[data-testid="login-email-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-password-input"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="login-submit-button"]').text()).toContain("Masuk");
  });

  it("login berhasil menyimpan token lalu menuju dashboard", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValueOnce({ token: "jwt-token" });
    const { wrapper, router, authStore } = renderWithProviders(LoginPage);
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    await fillAndSubmit(wrapper);
    expect(wrapper.get('[data-testid="login-submit-button"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Memeriksa akun...");
    await flushPromises();

    expect(authApi.postLogin).toHaveBeenCalledWith("budi@del.org", "rahasia");
    expect(apiHelper.getAccessToken()).toBe("jwt-token");
    expect(pushSpy).toHaveBeenCalledWith("/");
    expect(authStore.isAuthLogin).toBe(false);
    expect(authStore.isAuthLoggedIn).toBe(false);
    expect(wrapper.get('[data-testid="login-submit-button"]').attributes("disabled")).toBeUndefined();
  });

  it("login gagal menampilkan dialog error dan tetap di halaman", async () => {
    vi.mocked(authApi.postLogin).mockRejectedValueOnce(new Error("Kredensial salah"));
    const { wrapper, router } = renderWithProviders(LoginPage);
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
    expect(pushSpy).not.toHaveBeenCalled();
    expect(apiHelper.getAccessToken()).toBeNull();
  });
});
