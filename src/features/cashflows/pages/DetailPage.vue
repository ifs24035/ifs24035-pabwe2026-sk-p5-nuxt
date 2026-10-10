<template>
  <div v-if="loading" data-testid="detail-loading" class="flex justify-center py-24">
    <LoaderCircle :size="32" class="animate-spin text-ink-700" />
  </div>

  <div v-else-if="!cashFlow" data-testid="detail-not-found" class="mx-auto max-w-md py-20 text-center">
    <SearchX :size="42" class="mx-auto text-ink-200" />
    <h1 class="mt-3 text-xl font-bold text-ink-900">Transaksi tidak ditemukan</h1>
    <p class="mt-1 text-sm text-ink-500">Catatan ini mungkin sudah dihapus atau bukan milik akun Anda.</p>
    <RouterLink to="/" class="btn-primary mt-6">
      <ArrowLeft :size="18" />
      Kembali ke ringkasan
    </RouterLink>
  </div>

  <div v-else class="mx-auto max-w-3xl space-y-6 animate-rise">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <RouterLink
        to="/"
        data-testid="back-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft :size="18" />
        Kembali ke ringkasan
      </RouterLink>

      <div class="flex gap-2">
        <button type="button" data-testid="edit-detail-btn" class="btn-ghost" @click="showChangeModal = true">
          <Pencil :size="16" />
          Ubah
        </button>
        <button type="button" data-testid="delete-detail-btn" class="btn-danger" @click="handleDelete">
          <Trash2 :size="16" />
          Hapus
        </button>
      </div>
    </div>

    <article class="card overflow-hidden">
      <div
        class="p-6 sm:p-8"
        :class="cashFlow.type === 'inflow' ? 'bg-inflow-50' : 'bg-outflow-50'"
        data-testid="detail-header"
      >
        <span
          data-testid="detail-type"
          class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold"
          :class="cashFlow.type === 'inflow' ? 'text-inflow-700' : 'text-outflow-700'"
        >
          <ArrowDownLeft v-if="cashFlow.type === 'inflow'" :size="14" />
          <ArrowUpRight v-else :size="14" />
          {{ TYPE_LABELS[cashFlow.type] }}
        </span>

        <p
          data-testid="detail-nominal"
          class="mt-4 text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl"
          :class="cashFlow.type === 'inflow' ? 'text-inflow-700' : 'text-outflow-700'"
        >
          {{ cashFlow.type === "inflow" ? "+" : "-" }} {{ formatRupiah(cashFlow.nominal) }}
        </p>
        <h1 class="mt-1 text-sm font-medium text-ink-600">Transaksi #{{ cashFlow.id }}</h1>
      </div>

      <dl class="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <dt class="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <Tag :size="14" />
            Label kategori
          </dt>
          <dd data-testid="detail-label" class="mt-1 font-semibold text-ink-900">{{ cashFlow.label }}</dd>
        </div>
        <div>
          <dt class="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <Landmark :size="14" />
            Sumber dana
          </dt>
          <dd data-testid="detail-source" class="mt-1 font-semibold text-ink-900">{{ SOURCE_LABELS[cashFlow.source] }}</dd>
        </div>
        <div>
          <dt class="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <Calendar :size="14" />
            Dicatat pada
          </dt>
          <dd data-testid="detail-created" class="mt-1 text-sm text-ink-700">{{ formatDate(cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <Calendar :size="14" />
            Terakhir diperbarui
          </dt>
          <dd data-testid="detail-updated" class="mt-1 text-sm text-ink-700">{{ formatDate(cashFlow.updated_at) }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="flex items-center gap-2 text-xs font-semibold text-ink-400">
            <FileText :size="14" />
            Keterangan
          </dt>
          <dd data-testid="detail-description" class="mt-1 whitespace-pre-line rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
            {{ cashFlow.description }}
          </dd>
        </div>
      </dl>
    </article>

    <ChangeModal :show="showChangeModal" :cash-flow-id="cashFlowId" @close="showChangeModal = false" @saved="loadDetail" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  Landmark,
  LoaderCircle,
  Pencil,
  SearchX,
  Tag,
  Trash2,
} from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { SOURCE_LABELS, TYPE_LABELS } from "../api/cashFlowApi";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const loading = ref(true);
const showChangeModal = ref(false);

const cashFlowId = computed(() => String(route.params.cashFlowId));
const cashFlow = computed(() => cashFlowsStore.cashFlow);

async function loadDetail() {
  await cashFlowsStore.asyncSetCashFlow(cashFlowId.value);
  loading.value = false;
}

onMounted(() => {
  // Kosongkan data lama agar detail transaksi sebelumnya tidak sempat tampil.
  cashFlowsStore.setCashFlow(null);
  loadDetail();
});

watch(
  () => cashFlowsStore.isCashFlowDeleted,
  (deleted) => {
    if (!deleted) return;
    cashFlowsStore.setIsCashFlowDeleted(false);
    router.push("/");
  }
);

async function handleDelete() {
  const result = await showConfirmDialog("Transaksi ini akan dihapus permanen. Lanjutkan?");
  if (result.isConfirmed) {
    cashFlowsStore.asyncSetIsCashFlowDelete(cashFlowId.value);
  }
}
</script>
