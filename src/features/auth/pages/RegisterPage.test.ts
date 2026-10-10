import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import authApi from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

async function fillAndSubmit(wrapper: ReturnType<typeof renderWithProviders>["wrapper"]) {
  await wrapper.get('[data-testid="register-name-input"]').setValue("Budi");
  await wrapper.get('[data-testid="register-email-input"]').setValue("budi@del.org");
  await wrapper.get('[data-testid="register-password-input"]').setValue("rahasia");
  await wrapper.get("form").trigger("submit");
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan formulir pendaftaran", () => {
    const { wrapper } = renderWithProviders(RegisterPage);

    expect(wrapper.text()).toContain("Mulai mencatat arus kas");
    expect(wrapper.find('[data-testid="register-name-input"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="register-submit-button"]').text()).toContain("Buat akun");
  });

  it("pendaftaran berhasil mengarahkan ke halaman login", async () => {
    vi.mocked(authApi.postRegister).mockResolvedValueOnce("Berhasil mendaftar");
    const { wrapper, router, authStore } = renderWithProviders(RegisterPage);
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    await fillAndSubmit(wrapper);
    expect(wrapper.text()).toContain("Membuat akun...");
    await flushPromises();

    expect(authApi.postRegister).toHaveBeenCalledWith("Budi", "budi@del.org", "rahasia");
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
    expect(authStore.isAuthRegistered).toBe(false);
  });

  it("pendaftaran gagal menampilkan dialog error", async () => {
    vi.mocked(authApi.postRegister).mockRejectedValueOnce(new Error("Email sudah dipakai"));
    const { wrapper, router } = renderWithProviders(RegisterPage);
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    await fillAndSubmit(wrapper);
    await flushPromises();

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
