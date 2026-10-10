import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUsersStore } from "./usersStore";
import userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

const user = { id: 1, name: "Budi", email: "budi@del.org" };

describe("usersStore", () => {
  let store: ReturnType<typeof useUsersStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUsersStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal dan setter yang benar", () => {
    expect(store.users).toEqual([]);
    expect(store.profile).toBeNull();
    expect(store.isProfile).toBe(false);

    store.setUsers([user]);
    store.setProfile(user);
    store.setIsProfile(true);
    expect(store.users).toEqual([user]);
    expect(store.profile).toEqual(user);
    expect(store.isProfile).toBe(true);
  });

  it("asyncSetUsers berhasil dan gagal", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValueOnce([user]);
    await store.asyncSetUsers();
    expect(store.users).toEqual([user]);

    vi.mocked(userApi.getUsers).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetUsers();
    expect(store.users).toEqual([]);
  });

  it("asyncSetProfile berhasil dan gagal", async () => {
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(user);
    await store.asyncSetProfile();
    expect(store.profile).toEqual(user);
    expect(store.isProfile).toBe(true);

    vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetProfile();
    expect(store.profile).toBeNull();
  });

  it("asyncPutProfile berhasil dan gagal", async () => {
    vi.mocked(userApi.putProfile).mockResolvedValueOnce({ ...user, name: "Baru" });
    await expect(store.asyncPutProfile("Baru", user.email)).resolves.toBe(true);
    expect(store.profile?.name).toBe("Baru");
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalled();

    vi.mocked(userApi.putProfile).mockRejectedValueOnce(new Error("Email dipakai"));
    await expect(store.asyncPutProfile("a", "b")).resolves.toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email dipakai");
  });

  it("asyncPostProfilePhoto berhasil dan gagal", async () => {
    vi.mocked(userApi.postProfilePhoto).mockResolvedValueOnce("Foto diperbarui");
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(user);
    await expect(store.asyncPostProfilePhoto(new Blob(["x"]))).resolves.toBe(true);
    expect(store.profile).toEqual(user);
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto diperbarui");

    vi.mocked(userApi.postProfilePhoto).mockRejectedValueOnce(new Error("Gagal foto"));
    await expect(store.asyncPostProfilePhoto(new Blob(["x"]))).resolves.toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal foto");
  });

  it("asyncPutProfilePassword berhasil dan gagal", async () => {
    vi.mocked(userApi.putProfilePassword).mockResolvedValueOnce("Kata sandi diubah");
    await expect(store.asyncPutProfilePassword("a", "b", "b")).resolves.toBe(true);
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Kata sandi diubah");

    vi.mocked(userApi.putProfilePassword).mockRejectedValueOnce(new Error("Salah"));
    await expect(store.asyncPutProfilePassword("a", "b", "b")).resolves.toBe(false);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Salah");
  });
});
