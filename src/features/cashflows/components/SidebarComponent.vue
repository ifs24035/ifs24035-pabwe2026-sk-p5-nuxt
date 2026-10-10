<template>
  <div>
    <div
      v-if="isSidebarOpen"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-30 bg-ink-950/40 md:hidden"
      @click="emit('close-mobile')"
    />

    <aside
      class="fixed bottom-0 left-0 top-16 z-30 w-64 border-r border-ink-100 bg-white p-4 transition-transform duration-200 md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <nav class="space-y-1" aria-label="Menu utama">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          v-slot="{ href, navigate, isActive, isExactActive }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            :data-testid="`nav-${item.key}`"
            class="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition"
            :class="
              (item.exact ? isExactActive : isActive)
                ? 'bg-ink-900 text-white'
                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
            "
            @click="
              navigate($event);
              emit('close-mobile');
            "
          >
            <component
              :is="item.icon"
              :size="19"
              :class="(item.exact ? isExactActive : isActive) ? 'text-gold-400' : 'text-ink-300'"
            />
            <span>{{ item.label }}</span>
          </a>
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { LayoutDashboard, Users, UserCircle } from "lucide-vue-next";

interface SidebarProps {
  isSidebarOpen?: boolean;
}

withDefaults(defineProps<SidebarProps>(), {
  isSidebarOpen: false,
});

const emit = defineEmits<{
  (e: "close-mobile"): void;
}>();

const navItems = [
  { key: "home", to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard, exact: true },
  { key: "users", to: "/users", label: "Direktori Pengguna", icon: Users, exact: false },
  { key: "profile", to: "/profile", label: "Profil Saya", icon: UserCircle, exact: false },
];
</script>
