<template>
  <div v-if="!profile" class="flex flex-col items-center py-24 text-ink-400">
    <LoaderCircle :size="32" class="animate-spin text-ink-700" />
    <p class="mt-2 text-sm font-medium">Memuat data profil...</p>
  </div>

  <div v-else class="mx-auto max-w-4xl space-y-6 animate-rise">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Profil saya</h1>
      <p class="mt-1 text-sm text-ink-500">Kelola identitas, foto, dan keamanan akun Anda.</p>
    </div>

    <!-- Identitas -->
    <div class="card flex flex-col items-center gap-5 p-6 sm:flex-row sm:p-8">
      <div class="relative shrink-0">
        <img
          v-if="profile.photo"
          :src="profile.photo"
          :alt="profile.name"
          class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-ink-100"
        />
        <div
          v-else
          class="flex h-24 w-24 items-center justify-center rounded-full bg-ink-900 text-3xl font-bold text-gold-400"
        >
          {{ profile.name.charAt(0).toUpperCase() }}
        </div>

        <label
          for="profile-photo-input"
          data-testid="upload-profile-photo-btn"
          class="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-md hover:bg-gold-300"
          title="Ganti foto profil"
        >
          <LoaderCircle v-if="loadingPhoto" :size="16" class="animate-spin" />
          <Camera v-else :size="16" />
          <input
            id="profile-photo-input"
            data-testid="profile-photo-file-input"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handlePhotoUpload"
          />
        </label>
      </div>

      <div class="text-center sm:text-left">
        <h2 class="text-xl font-bold text-ink-900">{{ profile.name }}</h2>
        <p class="text-sm text-ink-500">{{ profile.email }}</p>
        <p class="mt-2 text-xs text-ink-400">Bergabung sejak {{ formatShortDate(profile.created_at) }}</p>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Biodata -->
      <form class="card space-y-4 p-6" @submit.prevent="handleUpdateProfile">
        <h3 class="flex items-center gap-2 font-bold text-ink-900">
          <User :size="18" class="text-ink-400" />
          Biodata
        </h3>

        <div>
          <label for="profile-name" class="field-label">Nama lengkap</label>
          <input id="profile-name" v-model="name" data-testid="profile-name-input" type="text" class="field" />
        </div>
        <div>
          <label for="profile-email" class="field-label">Email</label>
          <input id="profile-email" v-model="email" data-testid="profile-email-input" type="email" class="field" />
        </div>

        <button type="submit" data-testid="submit-profile-btn" :disabled="loadingProfile" class="btn-primary w-full">
          <LoaderCircle v-if="loadingProfile" :size="18" class="animate-spin" />
          <span>{{ loadingProfile ? "Menyimpan..." : "Simpan biodata" }}</span>
        </button>
      </form>

      <!-- Kata sandi -->
      <form class="card space-y-4 p-6" @submit.prevent="handleUpdatePassword">
        <h3 class="flex items-center gap-2 font-bold text-ink-900">
          <ShieldCheck :size="18" class="text-ink-400" />
          Keamanan
        </h3>

        <div>
          <label for="current-password" class="field-label">Kata sandi saat ini</label>
          <input id="current-password" v-model="oldPassword" data-testid="current-password-input" type="password" class="field" />
        </div>
        <div>
          <label for="new-password" class="field-label">Kata sandi baru</label>
          <input
            id="new-password"
            v-model="newPassword"
            data-testid="new-password-input"
            type="password"
            placeholder="Minimal 6 karakter"
            class="field"
          />
        </div>
        <div>
          <label for="confirm-password" class="field-label">Ulangi kata sandi baru</label>
          <input id="confirm-password" v-model="newPasswordConfirmation" data-testid="confirm-password-input" type="password" class="field" />
        </div>

        <button type="submit" data-testid="submit-password-btn" :disabled="loadingPassword" class="btn-primary w-full">
          <LoaderCircle v-if="loadingPassword" :size="18" class="animate-spin" />
          <span>{{ loadingPassword ? "Memperbarui..." : "Perbarui kata sandi" }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Camera, LoaderCircle, ShieldCheck, User } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { formatShortDate, showErrorDialog } from "../../../helpers/toolsHelper";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;

const usersStore = useUsersStore();
const profile = computed(() => usersStore.profile);

const name = ref("");
const email = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const newPasswordConfirmation = ref("");

const loadingProfile = ref(false);
const loadingPhoto = ref(false);
const loadingPassword = ref(false);

function syncProfile() {
  if (!profile.value) return;
  name.value = profile.value.name;
  email.value = profile.value.email;
}

onMounted(syncProfile);
watch(profile, syncProfile);

async function handleUpdateProfile() {
  if (!name.value.trim()) {
    showErrorDialog("Nama tidak boleh kosong");
    return;
  }
  if (!email.value.trim()) {
    showErrorDialog("Email tidak boleh kosong");
    return;
  }

  loadingProfile.value = true;
  await usersStore.asyncPutProfile(name.value.trim(), email.value.trim());
  loadingProfile.value = false;
}

async function handlePhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showErrorDialog("Pilih berkas gambar yang valid");
    return;
  }
  if (file.size > MAX_PHOTO_SIZE) {
    showErrorDialog("Ukuran foto maksimal 3 MB");
    return;
  }

  loadingPhoto.value = true;
  await usersStore.asyncPostProfilePhoto(file);
  loadingPhoto.value = false;
  input.value = "";
}

async function handleUpdatePassword() {
  if (!oldPassword.value) {
    showErrorDialog("Kata sandi saat ini wajib diisi");
    return;
  }
  if (newPassword.value.length < 6) {
    showErrorDialog("Kata sandi baru minimal 6 karakter");
    return;
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    showErrorDialog("Konfirmasi kata sandi tidak cocok");
    return;
  }

  loadingPassword.value = true;
  const success = await usersStore.asyncPutProfilePassword(
    oldPassword.value,
    newPassword.value,
    newPasswordConfirmation.value
  );
  loadingPassword.value = false;

  if (success) {
    oldPassword.value = "";
    newPassword.value = "";
    newPasswordConfirmation.value = "";
  }
}
</script>
