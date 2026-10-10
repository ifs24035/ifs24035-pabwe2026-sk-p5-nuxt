<template>
  <div>
    <h2 class="text-2xl font-extrabold tracking-tight text-ink-900">Selamat datang kembali</h2>
    <p class="mt-1 text-sm text-ink-500">Masuk untuk melihat saldo dan catatan arus kas Anda.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmitHandler">
      <div>
        <label for="login-email-input" class="field-label">Email</label>
        <div class="relative">
          <Mail :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            id="login-email-input"
            data-testid="login-email-input"
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
        <label for="login-password-input" class="field-label">Kata sandi</label>
        <div class="relative">
          <Lock :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            id="login-password-input"
            data-testid="login-password-input"
            type="password"
            :value="password"
            placeholder="Masukkan kata sandi"
            class="field pl-10"
            required
            @input="onPasswordChange"
          />
        </div>
      </div>

      <button id="login-submit-button" type="submit" data-testid="login-submit-button" :disabled="loading" class="btn-primary w-full">
        <LoaderCircle v-if="loading" :size="18" class="animate-spin" />
        <LogIn v-else :size="18" />
        <span>{{ loading ? "Memeriksa akun..." : "Masuk" }}</span>
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-ink-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-ink-900 underline decoration-gold-500 underline-offset-4">
        Buat akun
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { Mail, Lock, LogIn, LoaderCircle } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const loading = ref(false);

async function onSubmitHandler() {
  loading.value = true;
  await authStore.asyncSetIsAuthLogin(email.value, password.value);
  loading.value = false;
  authStore.setIsAuthLogin(false);

  if (authStore.isAuthLoggedIn) {
    authStore.setIsAuthLoggedIn(false);
    router.push("/");
  }
}
</script>
