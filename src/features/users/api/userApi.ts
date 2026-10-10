import apiHelper from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  async function unwrap(response: Response, fallback: string) {
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || fallback);
    }
    return result;
  }

  async function getUsers(): Promise<User[]> {
    const response = await apiHelper.fetchData(_url("/"), { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil data pengguna");
    return result.data.users;
  }

  async function getProfile(): Promise<User> {
    const response = await apiHelper.fetchData(_url("/me"), { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil data profil");
    return result.data.user;
  }

  async function putProfile(name: string, email: string): Promise<User> {
    const response = await apiHelper.fetchData(_url("/me"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const result = await unwrap(response, "Gagal mengubah profil");
    return result.data.user;
  }

  async function postProfilePhoto(photo: File | (Blob & { name?: string })): Promise<string> {
    const formData = new FormData();
    formData.append("photo", photo, photo.name || "photo.png");
    const response = await apiHelper.fetchData(_url("/me/photo"), {
      method: "POST",
      body: formData,
    });
    const result = await unwrap(response, "Gagal mengubah foto profil");
    return result.message;
  }

  async function putProfilePassword(
    password: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<string> {
    const response = await apiHelper.fetchData(_url("/password"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      }),
    });
    const result = await unwrap(response, "Gagal mengubah kata sandi");
    return result.message;
  }

  return { getUsers, getProfile, putProfile, postProfilePhoto, putProfilePassword };
})();

export default userApi;
