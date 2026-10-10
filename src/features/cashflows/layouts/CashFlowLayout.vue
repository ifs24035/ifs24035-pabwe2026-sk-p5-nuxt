<template>
  <div v-if="!usersStore.profile" class="flex min-h-screen items-center justify-center bg-paper">
    <div class="flex flex-col items-center gap-3">
      <LoaderCircle :size="32" class="animate-spin text-ink-700" />
      <p class="text-sm font-medium text-ink-500">Menyiapkan sesi Anda...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-paper text-ink-800">
    <NavbarComponent
      :profile="usersStore.profile"
      :is-sidebar-open="isSidebarOpen"
      @logout="handleLogout"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <SidebarComponent :is-sidebar-open="isSidebarOpen" @close-mobile="isSidebarOpen = false" />

    <main class="pt-16 md:pl-64">
      <div class="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, RouterView } from "vue-router";
import { LoaderCircle } from "lucide-vue-next";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import apiHelper from "../../../helpers/apiHelper";

const router = useRouter();
const usersStore = useUsersStore();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

// Rute dilindungi: tanpa token atau profil gagal dimuat -> kembali ke halaman login.
onMounted(() => {
  if (apiHelper.getAccessToken()) {
    usersStore.asyncSetProfile();
  } else {
    router.push("/auth/login");
  }
});

watch(
  () => usersStore.isProfile,
  (isProfile) => {
    if (!isProfile) return;
    usersStore.setIsProfile(false);
    if (!usersStore.profile) {
      apiHelper.putAccessToken("");
      router.push("/auth/login");
    }
  }
);

watch(
  () => authStore.isAuthLogout,
  (isAuthLogout) => {
    if (!isAuthLogout) return;
    authStore.setIsAuthLogout(false);
    usersStore.setProfile(null);
    router.push("/auth/login");
  }
);

function handleLogout() {
  authStore.asyncSetIsAuthLogout();
}
</script>
