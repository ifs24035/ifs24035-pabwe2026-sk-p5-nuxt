<template>
  <div class="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <!-- Panel merek -->
    <aside
      class="relative hidden overflow-hidden bg-ink-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12"
    >
      <div class="flex items-center gap-3">
        <img src="/logo.svg" alt="" class="h-10 w-10 rounded-xl" />
        <span class="text-lg font-bold tracking-tight">Delcom Cash Flow</span>
      </div>

      <div class="relative z-10 max-w-md">
        <p class="text-4xl font-extrabold leading-tight tracking-tight">
          Setiap rupiah punya cerita. Catat sebelum lupa.
        </p>
        <p class="mt-4 text-base leading-relaxed text-ink-200">
          Pantau uang masuk dan keluar dari kas, tabungan, dan pinjaman, lalu lihat saldo bersih Anda
          saat ini tanpa menghitung manual.
        </p>
      </div>

      <!-- Buku besar mini -->
      <div
        aria-hidden="true"
        class="relative z-10 space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm backdrop-blur"
      >
        <div class="flex items-center justify-between">
          <span class="text-ink-200">Gaji bulanan</span>
          <span class="font-semibold text-inflow-400">+ Rp 2.500.000</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-ink-200">Alat elektronik</span>
          <span class="font-semibold text-outflow-400">- Rp 400.000</span>
        </div>
        <div class="flex items-center justify-between border-t border-white/10 pt-2.5">
          <span class="text-ink-200">Saldo bersih</span>
          <span class="font-bold text-gold-400">Rp 2.100.000</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/5"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-white/5"
      />
    </aside>

    <!-- Panel formulir -->
    <main class="flex items-center justify-center px-5 py-12 sm:px-10">
      <div class="w-full max-w-md animate-rise">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <img src="/logo.svg" alt="" class="h-10 w-10 rounded-xl" />
          <span class="text-lg font-bold tracking-tight text-ink-900">Delcom Cash Flow</span>
        </div>

        <div class="mb-6 flex rounded-xl bg-ink-100 p-1">
          <RouterLink
            to="/auth/login"
            data-testid="tab-login"
            class="flex-1 rounded-lg py-2 text-center text-sm font-semibold transition"
            :class="isLoginActive ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'"
          >
            Masuk
          </RouterLink>
          <RouterLink
            to="/auth/register"
            data-testid="tab-register"
            class="flex-1 rounded-lg py-2 text-center text-sm font-semibold transition"
            :class="!isLoginActive ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'"
          >
            Buat akun
          </RouterLink>
        </div>

        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import apiHelper from "../../../helpers/apiHelper";

const route = useRoute();
const router = useRouter();

const isLoginActive = computed(() => route.path === "/auth/login");

// Pengguna yang masih memiliki sesi langsung diarahkan ke dashboard.
onMounted(() => {
  if (apiHelper.getAccessToken()) {
    router.push("/");
  }
});
</script>
