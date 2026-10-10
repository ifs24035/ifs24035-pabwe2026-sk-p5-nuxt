import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body } as any);
}

const user = { id: 1, name: "Budi", email: "budi@del.org" };

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getUsers mengembalikan daftar pengguna", async () => {
    mockResponse({ status: "success", data: { users: [user] } });
    await expect(userApi.getUsers()).resolves.toEqual([user]);
  });

  it("getUsers melempar pesan server atau bawaan", async () => {
    mockResponse({ status: "fail", message: "Ditolak" });
    await expect(userApi.getUsers()).rejects.toThrow("Ditolak");
    mockResponse({ status: "fail" });
    await expect(userApi.getUsers()).rejects.toThrow("Gagal mengambil data pengguna");
  });

  it("getProfile mengembalikan profil", async () => {
    const spy = mockResponse({ status: "success", data: { user } });
    await expect(userApi.getProfile()).resolves.toEqual(user);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("/users/me"), { method: "GET" });
  });

  it("getProfile melempar error", async () => {
    mockResponse({ status: "fail" });
    await expect(userApi.getProfile()).rejects.toThrow("Gagal mengambil data profil");
  });

  it("putProfile mengirim name dan email", async () => {
    const spy = mockResponse({ status: "success", data: { user } });
    await expect(userApi.putProfile("Budi", "budi@del.org")).resolves.toEqual(user);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/users/me"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Budi", email: "budi@del.org" }),
      })
    );
  });

  it("putProfile melempar error", async () => {
    mockResponse({ status: "fail" });
    await expect(userApi.putProfile("a", "b")).rejects.toThrow("Gagal mengubah profil");
  });

  it("postProfilePhoto memakai POST multipart", async () => {
    const spy = mockResponse({ status: "success", message: "Foto diperbarui" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await expect(userApi.postProfilePhoto(file)).resolves.toBe("Foto diperbarui");
    const [url, options] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/users/me/photo");
    expect(options.method).toBe("POST");
    expect((options.body as FormData).get("photo")).toBeInstanceOf(File);
  });

  it("postProfilePhoto memberi nama bawaan pada blob dan melempar error", async () => {
    const spy = mockResponse({ status: "success", message: "ok" });
    await userApi.postProfilePhoto(new Blob(["x"], { type: "image/png" }));
    const body = (spy.mock.calls[0][1] as RequestInit).body as FormData;
    expect((body.get("photo") as File).name).toBe("photo.png");

    mockResponse({ status: "fail" });
    await expect(userApi.postProfilePhoto(new Blob(["x"]))).rejects.toThrow("Gagal mengubah foto profil");
  });

  it("putProfilePassword mengirim konfirmasi kata sandi", async () => {
    const spy = mockResponse({ status: "success", message: "Kata sandi diubah" });
    await expect(userApi.putProfilePassword("lama", "baru12", "baru12")).resolves.toBe("Kata sandi diubah");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/users/password"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          password: "lama",
          new_password: "baru12",
          new_password_confirmation: "baru12",
        }),
      })
    );
  });

  it("putProfilePassword melempar error", async () => {
    mockResponse({ status: "fail" });
    await expect(userApi.putProfilePassword("a", "b", "c")).rejects.toThrow("Gagal mengubah kata sandi");
  });
});
