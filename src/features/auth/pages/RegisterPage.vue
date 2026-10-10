<template>
  <div>
    <h2 class="text-2xl font-extrabold tracking-tight text-ink-900">Mulai mencatat arus kas</h2>
    <p class="mt-1 text-sm text-ink-500">Buat akun Delcom untuk menyimpan catatan keuangan Anda.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmitHandler">
      <div>
        <label for="register-name-input" class="field-label">Nama lengkap</label>
        <div class="relative">
          <User :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            id="register-name-input"
            data-testid="register-name-input"
            type="text"
            :value="name"
            placeholder="Nama Anda"
            class="field pl-10"
            required
            @input="onNameChange"
          />
        </div>
      </div>

      <div>
        <label for="register-email-input" class="field-label">Email</label>
        <div class="relative">
          <Mail :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            id="register-email-input"
            data-testid="register-email-input"
            type="email"
            :value="email"
            placeholder="nama@email.com"
            class="field pl-10"
            required
            @input="onEmailChange"
          />
        </div>
      </div>

      <div>
        <label for="register-password-input" class="field-label">Kata sandi</label>
        <div class="relative">
          <Lock :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            id="register-password-input"
            data-testid="register-password-input"
            type="password"
            :value="password"
            placeholder="Minimal 6 karakter"
            class="field pl-10"
            required
            @input="onPasswordChange"
          />
        </div>
      </div>

      <button type="submit" data-testid="register-submit-button" :disabled="loading" class="btn-primary w-full">
        <LoaderCircle v-if="loading" :size="18" class="animate-spin" />
        <UserPlus v-else :size="18" />
        <span>{{ loading ? "Membuat akun..." : "Buat akun" }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-ink-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-ink-900 underline decoration-gold-500 underline-offset-4">
        Masuk
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { User, Mail, Lock, UserPlus, LoaderCircle } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const loading = ref(false);

async function onSubmitHandler() {
  loading.value = true;
  await authStore.asyncSetIsAuthRegister(name.value, email.value, password.value);
  loading.value = false;
  authStore.setIsAuthRegister(false);

  if (authStore.isAuthRegistered) {
    authStore.setIsAuthRegistered(false);
    router.push("/auth/login");
  }
}
</script>
