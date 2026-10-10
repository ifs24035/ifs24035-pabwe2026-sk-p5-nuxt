import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body } as any);
}

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postRegister", () => {
    it("mengembalikan pesan saat berhasil", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mendaftar" });
      const message = await authApi.postRegister("Budi", "budi@del.org", "123456");

      expect(message).toBe("Berhasil mendaftar");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("melempar pesan dari server", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Data tidak valid");
    });

    it("memakai pesan bawaan dan mengabaikan data non-objek", async () => {
      mockResponse({ status: "fail", data: "teks" });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Gagal melakukan pendaftaran");
    });

    it("menyertakan detail validasi", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid", data: { email: ["Email dipakai"] } });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Data tidak valid: Email dipakai");
    });

    it("tidak menambahkan detail jika data kosong", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid", data: {} });
      await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow(/^Data tidak valid$/);
    });
  });

  describe("postLogin", () => {
    it("mengembalikan data token", async () => {
      mockResponse({ status: "success", data: { token: "jwt" } });
      await expect(authApi.postLogin("a@b.c", "pw")).resolves.toEqual({ token: "jwt" });
    });

    it("melempar pesan server atau bawaan", async () => {
      mockResponse({ status: "fail", message: "Kredensial salah" });
      await expect(authApi.postLogin("a", "b")).rejects.toThrow("Kredensial salah");
      mockResponse({ status: "fail" });
      await expect(authApi.postLogin("a", "b")).rejects.toThrow("Gagal login");
    });
  });

  describe("postLogout", () => {
    it("mengembalikan pesan saat berhasil", async () => {
      mockResponse({ status: "success", message: "Berhasil keluar" });
      await expect(authApi.postLogout()).resolves.toBe("Berhasil keluar");
    });

    it("melempar pesan server atau bawaan", async () => {
      mockResponse({ status: "fail", message: "Tidak terautentikasi" });
      await expect(authApi.postLogout()).rejects.toThrow("Tidak terautentikasi");
      mockResponse({ status: "fail" });
      await expect(authApi.postLogout()).rejects.toThrow("Gagal logout");
    });
  });
});
