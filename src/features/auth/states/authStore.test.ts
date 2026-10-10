import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/apiHelper", () => ({ default: { putAccessToken: vi.fn() } }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

describe("authStore", () => {
  let store: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal yang benar", () => {
    expect(store.$state).toEqual({
      isAuthRegister: false,
      isAuthRegistered: false,
      isAuthLogin: false,
      isAuthLoggedIn: false,
      isAuthLogout: false,
      isAuthLoggedOut: false,
    });
  });

  it("memperbarui state lewat setter", () => {
    store.setIsAuthRegister(true);
    store.setIsAuthRegistered(true);
    store.setIsAuthLogin(true);
    store.setIsAuthLoggedIn(true);
    store.setIsAuthLogout(true);
    store.setIsAuthLoggedOut(true);
    expect(Object.values(store.$state).every(Boolean)).toBe(true);
  });

  it("register berhasil", async () => {
    vi.mocked(authApi.postRegister).mockResolvedValueOnce("Pendaftaran berhasil");
    await store.asyncSetIsAuthRegister("Budi", "budi@del.org", "pw");

    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Pendaftaran berhasil");
    expect(store.isAuthRegistered).toBe(true);
    expect(store.isAuthRegister).toBe(true);
  });

  it("register gagal", async () => {
    vi.mocked(authApi.postRegister).mockRejectedValueOnce(new Error("Email dipakai"));
    await store.asyncSetIsAuthRegister("Budi", "budi@del.org", "pw");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email dipakai");
    expect(store.isAuthRegistered).toBe(false);
    expect(store.isAuthRegister).toBe(true);
  });

  it("login berhasil menyimpan token", async () => {
    vi.mocked(authApi.postLogin).mockResolvedValueOnce({ token: "jwt" });
    await store.asyncSetIsAuthLogin("budi@del.org", "pw");

    expect(apiHelper.putAccessToken).toHaveBeenCalledWith("jwt");
    expect(store.isAuthLoggedIn).toBe(true);
    expect(store.isAuthLogin).toBe(true);
  });

  it("login gagal menampilkan dialog error", async () => {
    vi.mocked(authApi.postLogin).mockRejectedValueOnce(new Error("Kredensial salah"));
    await store.asyncSetIsAuthLogin("budi@del.org", "salah");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
    expect(store.isAuthLoggedIn).toBe(false);
    expect(store.isAuthLogin).toBe(true);
  });

  it("logout membersihkan token saat API berhasil", async () => {
    vi.mocked(authApi.postLogout).mockResolvedValueOnce("ok");
    await store.asyncSetIsAuthLogout();

    expect(apiHelper.putAccessToken).toHaveBeenCalledWith("");
    expect(store.isAuthLoggedOut).toBe(true);
    expect(store.isAuthLogout).toBe(true);
  });

  it("logout tetap membersihkan token saat API gagal", async () => {
    vi.mocked(authApi.postLogout).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetIsAuthLogout();

    expect(apiHelper.putAccessToken).toHaveBeenCalledWith("");
    expect(store.isAuthLogout).toBe(true);
  });
});
