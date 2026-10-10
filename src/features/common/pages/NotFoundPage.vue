<template>
  <main class="flex min-h-screen items-center justify-center bg-paper px-6">
    <div class="max-w-md text-center animate-rise">
      <img src="/logo.svg" alt="" class="mx-auto h-14 w-14 rounded-2xl" />
      <p class="mt-8 text-7xl font-extrabold tracking-tighter text-ink-900">404</p>
      <h1 class="mt-2 text-xl font-bold text-ink-900">Halaman Tidak Ditemukan</h1>
      <p class="mt-2 text-sm leading-relaxed text-ink-500">
        Alamat yang Anda buka tidak ada atau sudah dipindahkan. Kembali ke ringkasan arus kas untuk
        melanjutkan.
      </p>
      <RouterLink to="/" data-testid="back-home-link" class="btn-primary mt-8">
        <ArrowLeft :size="18" />
        Kembali ke beranda
      </RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
</script>
