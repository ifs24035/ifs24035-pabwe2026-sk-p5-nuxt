<template>
  <div class="space-y-6 animate-rise">
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Direktori pengguna</h1>
      <p class="mt-1 text-sm text-ink-500">Semua akun yang terdaftar di Delcom.</p>
    </div>

    <div class="card overflow-hidden">
      <div class="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="relative w-full sm:max-w-md">
          <Search :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            v-model="search"
            data-testid="search-user-input"
            type="search"
            aria-label="Cari pengguna"
            placeholder="Cari berdasarkan nama atau email"
            class="field pl-10"
          />
        </div>
        <span class="w-fit rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600" data-testid="user-count">
          {{ filteredUsers.length }} pengguna
        </span>
      </div>

      <div class="p-4 sm:p-5">
        <div v-if="loadingUsers" data-testid="users-loading" class="flex flex-col items-center py-14 text-ink-400">
          <LoaderCircle :size="30" class="animate-spin text-ink-700" />
          <p class="mt-2 text-sm font-medium">Memuat daftar pengguna...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" data-testid="users-empty" class="flex flex-col items-center py-14 text-center">
          <SearchX :size="38" class="text-ink-200" />
          <p class="mt-3 font-semibold text-ink-700">Pengguna tidak ditemukan.</p>
          <p class="mt-1 text-sm text-ink-400">Coba kata kunci lain.</p>
        </div>

        <ul v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            :data-testid="`user-card-${user.id}`"
            class="flex flex-col justify-between rounded-2xl border border-ink-100 p-4"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="user.photo"
                :src="user.photo"
                :alt="user.name"
                class="h-12 w-12 shrink-0 rounded-full border border-ink-100 object-cover"
              />
              <div
                v-else
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-bold text-gold-400"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="truncate font-bold text-ink-900">{{ user.name }}</p>
                <p class="flex items-center gap-1.5 truncate text-xs text-ink-500">
                  <Mail :size="13" class="shrink-0 text-ink-300" />
                  <span class="truncate">{{ user.email }}</span>
                </p>
              </div>
            </div>
            <p class="mt-4 flex items-center gap-1.5 border-t border-ink-100 pt-3 text-xs text-ink-400">
              <Calendar :size="13" />
              Bergabung {{ formatShortDate(user.created_at) }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Calendar, LoaderCircle, Mail, Search, SearchX } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { formatShortDate } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const search = ref("");
const loadingUsers = ref(false);

onMounted(async () => {
  loadingUsers.value = true;
  await usersStore.asyncSetUsers();
  loadingUsers.value = false;
});

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase();
  return usersStore.users.filter(
    (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );
});
</script>
