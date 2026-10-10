import { defineStore } from "pinia";
import userApi, { type User } from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface UsersState {
  users: User[];
  profile: User | null;
  isProfile: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isProfile: false,
  }),
  actions: {
    setUsers(users: User[]) {
      this.users = users;
    },
    setProfile(profile: User | null) {
      this.profile = profile;
    },
    setIsProfile(status: boolean) {
      this.isProfile = status;
    },
    async asyncSetUsers() {
      try {
        this.setUsers(await userApi.getUsers());
      } catch {
        this.setUsers([]);
      }
    },
    async asyncSetProfile() {
      try {
        this.setProfile(await userApi.getProfile());
      } catch {
        this.setProfile(null);
      } finally {
        this.setIsProfile(true);
      }
    },
    /** Mengembalikan `true` jika profil berhasil diperbarui. */
    async asyncPutProfile(name: string, email: string): Promise<boolean> {
      try {
        this.setProfile(await userApi.putProfile(name, email));
        showSuccessDialog("Profil berhasil diperbarui.");
        return true;
      } catch (error: any) {
        showErrorDialog(error.message);
        return false;
      }
    },
    async asyncPostProfilePhoto(photo: File | (Blob & { name?: string })): Promise<boolean> {
      try {
        const message = await userApi.postProfilePhoto(photo);
        this.setProfile(await userApi.getProfile());
        showSuccessDialog(message);
        return true;
      } catch (error: any) {
        showErrorDialog(error.message);
        return false;
      }
    },
    async asyncPutProfilePassword(
      oldPassword: string,
      newPassword: string,
      newPasswordConfirmation: string
    ): Promise<boolean> {
      try {
        const message = await userApi.putProfilePassword(
          oldPassword,
          newPassword,
          newPasswordConfirmation
        );
        showSuccessDialog(message);
        return true;
      } catch (error: any) {
        showErrorDialog(error.message);
        return false;
      }
    },
  },
});
