<template>
  <header class="fixed inset-x-0 top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          type="button"
          data-testid="toggle-sidebar-btn"
          aria-label="Buka atau tutup menu"
          class="rounded-lg p-2 text-ink-600 hover:bg-ink-50 md:hidden"
          @click="emit('toggle-sidebar')"
        >
          <X v-if="isSidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>

        <RouterLink to="/" class="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" class="h-9 w-9 rounded-xl" />
          <span class="text-base font-bold tracking-tight text-ink-900">Delcom Cash Flow</span>
        </RouterLink>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <div class="hidden items-center gap-3 sm:flex" data-testid="navbar-user">
          <img
            v-if="profile?.photo"
            :src="profile.photo"
            :alt="profile.name"
            class="h-9 w-9 rounded-full border border-ink-100 object-cover"
          />
          <div
            v-else
            class="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-gold-400"
          >
            {{ initial }}
          </div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-ink-900" data-testid="navbar-name">{{ profile?.name }}</p>
            <p class="text-xs text-ink-400" data-testid="navbar-username">@{{ username }}</p>
          </div>
        </div>

        <span
          class="hidden items-center gap-1.5 rounded-full bg-inflow-50 px-2.5 py-1 text-xs font-semibold text-inflow-700 lg:inline-flex"
          data-testid="navbar-session"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-inflow-500" />
          Sesi aktif
        </span>

        <button type="button" data-testid="logout-button" class="btn-ghost !px-3 !py-2" @click="emit('logout')">
          <LogOut :size="16" />
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { LogOut, Menu, X } from "lucide-vue-next";
import type { User } from "../../users/api/userApi";

interface NavbarProps {
  profile?: User | null;
  isSidebarOpen?: boolean;
}

const props = withDefaults(defineProps<NavbarProps>(), {
  profile: null,
  isSidebarOpen: false,
});

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
  (e: "logout"): void;
}>();

const initial = computed(() => (props.profile?.name || "U").charAt(0).toUpperCase());
// API tidak memiliki field username, jadi diambil dari bagian depan email.
const username = computed(() => (props.profile?.email || "").split("@")[0]);
</script>
