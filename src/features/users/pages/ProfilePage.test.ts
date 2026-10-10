import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import userApi from "../api/userApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = {
  id: 1,
  name: "Budi Tobing",
  email: "budi@del.ac.id",
  photo: null,
  created_at: "2024-10-05T11:26:45.000000Z",
};

const value = (wrapper: any, testId: string) =>
  (wrapper.get(`[data-testid="${testId}"]`).element as HTMLInputElement).value;

function mountProfile(overrides: Record<string, any> = {}) {
  return renderWithProviders(ProfilePage, { preloadedState: { profile, ...overrides } });
}

async function chooseFile(wrapper: any, files: any[]) {
  const input = wrapper.get('[data-testid="profile-photo-file-input"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
  await flushPromises();
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tampilan", () => {
    it("menampilkan status memuat saat profil belum tersedia lalu mengisi formulir", async () => {
      const { wrapper, usersStore } = renderWithProviders(ProfilePage);
      expect(wrapper.text()).toContain("Memuat data profil...");

      usersStore.setProfile(profile);
      await flushPromises();

      expect(wrapper.text()).toContain("Profil saya");
      expect(value(wrapper, "profile-name-input")).toBe("Budi Tobing");
      expect(value(wrapper, "profile-email-input")).toBe("budi@del.ac.id");
    });

    it("menampilkan inisial jika belum ada foto dan foto jika tersedia", () => {
      const withoutPhoto = mountProfile();
      expect(withoutPhoto.wrapper.find("img[alt='Budi Tobing']").exists()).toBe(false);
      expect(withoutPhoto.wrapper.text()).toContain("B");

      const withPhoto = mountProfile({ profile: { ...profile, photo: "http://x.test/foto.png" } });
      expect(withPhoto.wrapper.get("img[alt='Budi Tobing']").attributes("src")).toBe("http://x.test/foto.png");
    });
  });

  describe("biodata", () => {
    it("menolak nama atau email kosong", async () => {
      const { wrapper } = mountProfile();

      await wrapper.get('[data-testid="profile-name-input"]').setValue("  ");
      await wrapper.get('[data-testid="submit-profile-btn"]').trigger("submit");
      expect(toolsHelper.showErrorDialog).toHaveBeenLastCalledWith("Nama tidak boleh kosong");

      await wrapper.get('[data-testid="profile-name-input"]').setValue("Budi");
      await wrapper.get('[data-testid="profile-email-input"]').setValue("");
      await wrapper.get('[data-testid="submit-profile-btn"]').trigger("submit");
      expect(toolsHelper.showErrorDialog).toHaveBeenLastCalledWith("Email tidak boleh kosong");
      expect(userApi.putProfile).not.toHaveBeenCalled();
    });

    it("menyimpan biodata dengan menampilkan status menyimpan", async () => {
      let resolveRequest!: (value: any) => void;
      vi.mocked(userApi.putProfile).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );
      const { wrapper, usersStore } = mountProfile();

      await wrapper.get('[data-testid="profile-name-input"]').setValue("Budi Baru");
      await wrapper.get('[data-testid="profile-email-input"]').setValue("baru@del.ac.id");
      await wrapper.get('[data-testid="submit-profile-btn"]').trigger("submit");
      expect(wrapper.get('[data-testid="submit-profile-btn"]').text()).toContain("Menyimpan...");

      resolveRequest({ ...profile, name: "Budi Baru", email: "baru@del.ac.id" });
      await flushPromises();

      expect(userApi.putProfile).toHaveBeenCalledWith("Budi Baru", "baru@del.ac.id");
      expect(usersStore.profile?.name).toBe("Budi Baru");
      expect(wrapper.get('[data-testid="submit-profile-btn"]').text()).toContain("Simpan biodata");
    });
  });

  describe("foto profil", () => {
    it("mengabaikan jika tidak ada berkas yang dipilih", async () => {
      const { wrapper } = mountProfile();

      await chooseFile(wrapper, []);

      expect(userApi.postProfilePhoto).not.toHaveBeenCalled();
      expect(toolsHelper.showErrorDialog).not.toHaveBeenCalled();
    });

    it("mengabaikan jika daftar berkas tidak tersedia", async () => {
      const { wrapper } = mountProfile();

      await chooseFile(wrapper, null as any);

      expect(userApi.postProfilePhoto).not.toHaveBeenCalled();
    });

    it("menolak berkas yang bukan gambar", async () => {
      const { wrapper } = mountProfile();

      await chooseFile(wrapper, [new File(["x"], "dokumen.pdf", { type: "application/pdf" })]);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Pilih berkas gambar yang valid");
      expect(userApi.postProfilePhoto).not.toHaveBeenCalled();
    });

    it("menolak gambar lebih dari 3 MB", async () => {
      const { wrapper } = mountProfile();
      const big = new File(["x"], "besar.png", { type: "image/png" });
      Object.defineProperty(big, "size", { value: 4 * 1024 * 1024 });

      await chooseFile(wrapper, [big]);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Ukuran foto maksimal 3 MB");
      expect(userApi.postProfilePhoto).not.toHaveBeenCalled();
    });

    it("mengunggah foto dan memperbarui profil", async () => {
      vi.mocked(userApi.postProfilePhoto).mockResolvedValue("Foto diperbarui");
      vi.mocked(userApi.getProfile).mockResolvedValue({ ...profile, photo: "http://x.test/baru.png" });
      const { wrapper } = mountProfile();
      const file = new File(["x"], "foto.png", { type: "image/png" });

      await chooseFile(wrapper, [file]);

      expect(userApi.postProfilePhoto).toHaveBeenCalledWith(file);
      expect(wrapper.get("img[alt='Budi Tobing']").attributes("src")).toBe("http://x.test/baru.png");
    });
  });

  describe("kata sandi", () => {
    async function submitPassword(wrapper: any, oldPassword: string, next: string, confirmation: string) {
      await wrapper.get('[data-testid="current-password-input"]').setValue(oldPassword);
      await wrapper.get('[data-testid="new-password-input"]').setValue(next);
      await wrapper.get('[data-testid="confirm-password-input"]').setValue(confirmation);
      await wrapper.get('[data-testid="submit-password-btn"]').trigger("submit");
      await flushPromises();
    }

    it("memvalidasi kata sandi saat ini, panjang, dan konfirmasi", async () => {
      const { wrapper } = mountProfile();

      await submitPassword(wrapper, "", "baru123", "baru123");
      expect(toolsHelper.showErrorDialog).toHaveBeenLastCalledWith("Kata sandi saat ini wajib diisi");

      await submitPassword(wrapper, "lama", "123", "123");
      expect(toolsHelper.showErrorDialog).toHaveBeenLastCalledWith("Kata sandi baru minimal 6 karakter");

      await submitPassword(wrapper, "lama", "baru123", "beda123");
      expect(toolsHelper.showErrorDialog).toHaveBeenLastCalledWith("Konfirmasi kata sandi tidak cocok");
      expect(userApi.putProfilePassword).not.toHaveBeenCalled();
    });

    it("mengosongkan kolom setelah berhasil", async () => {
      vi.mocked(userApi.putProfilePassword).mockResolvedValue("Kata sandi diubah");
      const { wrapper } = mountProfile();

      await submitPassword(wrapper, "lama123", "baru123", "baru123");

      expect(userApi.putProfilePassword).toHaveBeenCalledWith("lama123", "baru123", "baru123");
      expect(value(wrapper, "current-password-input")).toBe("");
      expect(value(wrapper, "new-password-input")).toBe("");
      expect(value(wrapper, "confirm-password-input")).toBe("");
    });

    it("mempertahankan isian jika gagal", async () => {
      vi.mocked(userApi.putProfilePassword).mockRejectedValue(new Error("Kata sandi salah"));
      const { wrapper } = mountProfile();

      await submitPassword(wrapper, "lama123", "baru123", "baru123");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kata sandi salah");
      expect(value(wrapper, "current-password-input")).toBe("lama123");
    });
  });
});
