<template>
  <div class="space-y-8 animate-rise">
    <!-- Judul & aksi utama -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Ringkasan arus kas</h1>
        <p class="mt-1 text-sm text-ink-500">Lihat saldo bersih dan seluruh transaksi Anda dalam satu halaman.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" data-testid="reset-all-btn" class="btn-danger" @click="handleDeleteAll">
          <RotateCcw :size="17" />
          Reset semua
        </button>
        <button type="button" data-testid="add-cash-flow-btn" class="btn-gold" @click="showAddModal = true">
          <Plus :size="18" />
          Catat transaksi
        </button>
      </div>
    </div>

    <!-- Saldo bersih -->
    <section aria-label="Saldo kas bersih" class="overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <p class="text-sm font-medium text-ink-200">Total saldo kas bersih</p>
          <p
            data-testid="stat-cashflow"
            class="mt-2 text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl"
            :class="stats.cashflow < 0 ? 'text-outflow-400' : 'text-white'"
          >
            {{ formatRupiah(stats.cashflow) }}
          </p>
        </div>

        <div>
          <div class="flex h-3 overflow-hidden rounded-full bg-white/10" role="img" :aria-label="flowAriaLabel">
            <div
              data-testid="flow-bar-inflow"
              class="bg-inflow-400 transition-all duration-500"
              :style="{ width: `${flowShare.inflow}%` }"
            />
            <div
              data-testid="flow-bar-outflow"
              class="bg-outflow-400 transition-all duration-500"
              :style="{ width: `${flowShare.outflow}%` }"
            />
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt class="flex items-center gap-1.5 text-xs font-medium text-ink-200">
                <span class="h-2 w-2 rounded-full bg-inflow-400" />
                Total pemasukan
              </dt>
              <dd data-testid="stat-inflow" class="mt-1 text-lg font-bold tabular-nums">
                {{ formatRupiah(stats.total_inflow) }}
              </dd>
            </div>
            <div>
              <dt class="flex items-center gap-1.5 text-xs font-medium text-ink-200">
                <span class="h-2 w-2 rounded-full bg-outflow-400" />
                Total pengeluaran
              </dt>
              <dd data-testid="stat-outflow" class="mt-1 text-lg font-bold tabular-nums">
                {{ formatRupiah(stats.total_outflow) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Saldo per sumber dana -->
    <section aria-label="Saldo per sumber dana" class="grid gap-4 sm:grid-cols-3">
      <div v-for="item in sourceCards" :key="item.key" :data-testid="`stat-card-${item.key}`" class="card p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="item.tone">
            <component :is="item.icon" :size="20" />
          </div>
          <p class="text-sm font-semibold text-ink-600">{{ item.label }}</p>
        </div>
        <p class="mt-4 text-2xl font-extrabold tabular-nums tracking-tight text-ink-900" :data-testid="`stat-${item.key}`">
          {{ formatRupiah(item.value) }}
        </p>
      </div>
    </section>

    <!-- Tren -->
    <section aria-label="Tren arus kas" class="card p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-ink-900">Tren arus kas</h2>
          <p class="text-xs text-ink-400">Pemasukan dan pengeluaran per periode.</p>
        </div>
        <div class="flex rounded-xl bg-ink-100 p-1 text-sm font-semibold">
          <button
            type="button"
            data-testid="trend-daily"
            class="rounded-lg px-3 py-1.5 transition"
            :class="trendMode === 'daily' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'"
            @click="trendMode = 'daily'"
          >
            Harian
          </button>
          <button
            type="button"
            data-testid="trend-monthly"
            class="rounded-lg px-3 py-1.5 transition"
            :class="trendMode === 'monthly' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'"
            @click="trendMode = 'monthly'"
          >
            Bulanan
          </button>
        </div>
      </div>

      <p v-if="trendRows.length === 0" data-testid="trend-empty" class="py-10 text-center text-sm text-ink-400">
        Belum ada data tren untuk ditampilkan.
      </p>
      <div v-else class="mt-6 flex h-40 items-end gap-2 sm:gap-4" data-testid="trend-chart">
        <div v-for="row in trendRows" :key="row.key" class="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
          <div class="flex w-full flex-1 items-end justify-center gap-1">
            <div
              class="min-h-[2px] w-1/2 max-w-4 rounded-t bg-inflow-500"
              :style="{ height: `${row.inflowPct}%` }"
              :title="`Pemasukan ${formatRupiah(row.inflow)}`"
            />
            <div
              class="min-h-[2px] w-1/2 max-w-4 rounded-t bg-outflow-500"
              :style="{ height: `${row.outflowPct}%` }"
              :title="`Pengeluaran ${formatRupiah(row.outflow)}`"
            />
          </div>
          <span class="w-full truncate text-center text-[11px] font-medium text-ink-400">{{ row.label }}</span>
        </div>
      </div>
    </section>

    <!-- Filter -->
    <section aria-label="Filter transaksi" class="card p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-base font-bold text-ink-900">
          <Filter :size="17" class="text-ink-400" />
          Filter transaksi
        </h2>
        <button
          v-if="hasFilters"
          type="button"
          data-testid="clear-filters-btn"
          class="text-sm font-semibold text-ink-500 underline underline-offset-4 hover:text-ink-900"
          @click="clearFilters"
        >
          Hapus filter
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label for="filter-type" class="field-label">Jenis</label>
          <select id="filter-type" v-model="filters.type" data-testid="filter-type" class="field">
            <option value="">Semua jenis</option>
            <option value="inflow">Pemasukan</option>
            <option value="outflow">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label for="filter-source" class="field-label">Sumber dana</label>
          <select id="filter-source" v-model="filters.source" data-testid="filter-source" class="field">
            <option value="">Semua sumber</option>
            <option value="cash">Tunai</option>
            <option value="savings">Tabungan</option>
            <option value="loans">Pinjaman</option>
          </select>
        </div>
        <div>
          <label for="filter-label" class="field-label">Label</label>
          <select id="filter-label" v-model="filters.label" data-testid="filter-label" class="field">
            <option value="">Semua label</option>
            <option v-for="label in cashFlowsStore.labels" :key="label" :value="label">{{ label }}</option>
          </select>
        </div>
        <div>
          <label for="filter-start" class="field-label">Dari tanggal</label>
          <input id="filter-start" v-model="filters.start_date" data-testid="filter-start" type="date" class="field" />
        </div>
        <div>
          <label for="filter-end" class="field-label">Sampai tanggal</label>
          <input id="filter-end" v-model="filters.end_date" data-testid="filter-end" type="date" class="field" />
        </div>
      </div>
    </section>

    <!-- Daftar transaksi -->
    <section aria-label="Daftar transaksi" class="card overflow-hidden">
      <div class="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <h2 class="text-base font-bold text-ink-900">Riwayat transaksi</h2>
        <span class="rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600" data-testid="total-count">
          {{ cashFlows.length }} transaksi
        </span>
      </div>

      <div v-if="loading" data-testid="loading-state" class="flex flex-col items-center py-16 text-ink-400">
        <LoaderCircle :size="30" class="animate-spin text-ink-700" />
        <p class="mt-2 text-sm font-medium">Memuat transaksi...</p>
      </div>

      <div v-else-if="cashFlows.length === 0" data-testid="empty-state" class="flex flex-col items-center px-6 py-16 text-center">
        <Inbox :size="40" class="text-ink-200" />
        <p class="mt-3 font-semibold text-ink-700">
          {{ hasFilters ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada transaksi tercatat." }}
        </p>
        <p class="mt-1 text-sm text-ink-400">
          {{ hasFilters ? "Ubah atau hapus filter untuk melihat transaksi lain." : "Catat pemasukan atau pengeluaran pertama Anda." }}
        </p>
      </div>

      <template v-else>
        <!-- Tabel (layar lebar) -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full text-left text-sm">
            <thead class="bg-ink-50 text-xs font-semibold text-ink-500">
              <tr>
                <th class="px-5 py-3">Transaksi</th>
                <th class="px-5 py-3">Sumber</th>
                <th class="px-5 py-3">Tanggal</th>
                <th class="px-5 py-3 text-right">Nominal</th>
                <th class="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              <tr v-for="item in cashFlows" :key="item.id" :data-testid="`row-${item.id}`" class="hover:bg-ink-50/60">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      :class="item.type === 'inflow' ? 'bg-inflow-50 text-inflow-600' : 'bg-outflow-50 text-outflow-600'"
                    >
                      <ArrowDownLeft v-if="item.type === 'inflow'" :size="18" />
                      <ArrowUpRight v-else :size="18" />
                    </span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-ink-900">{{ item.label }}</p>
                      <p class="truncate text-xs text-ink-400">{{ item.description }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-ink-600">{{ SOURCE_LABELS[item.source] }}</td>
                <td class="whitespace-nowrap px-5 py-3.5 text-ink-500">{{ formatShortDate(item.created_at) }}</td>
                <td class="whitespace-nowrap px-5 py-3.5 text-right">
                  <span
                    class="font-bold tabular-nums"
                    :class="item.type === 'inflow' ? 'text-inflow-600' : 'text-outflow-600'"
                  >
                    {{ item.type === "inflow" ? "+" : "-" }} {{ formatRupiah(item.nominal) }}
                  </span>
                  <p class="mt-0.5">
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      :class="
                        item.type === 'inflow' ? 'bg-inflow-50 text-inflow-700' : 'bg-outflow-50 text-outflow-700'
                      "
                    >
                      {{ TYPE_LABELS[item.type] }}
                    </span>
                  </p>
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex justify-end gap-1">
                    <RouterLink
                      :to="`/cash-flows/${item.id}`"
                      :data-testid="`detail-btn-${item.id}`"
                      aria-label="Lihat detail"
                      class="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-800"
                    >
                      <Eye :size="17" />
                    </RouterLink>
                    <button
                      type="button"
                      :data-testid="`edit-btn-${item.id}`"
                      aria-label="Ubah"
                      class="rounded-lg p-2 text-ink-400 hover:bg-gold-300/30 hover:text-gold-600"
                      @click="handleEdit(item.id)"
                    >
                      <Pencil :size="17" />
                    </button>
                    <button
                      type="button"
                      :data-testid="`delete-btn-${item.id}`"
                      aria-label="Hapus"
                      class="rounded-lg p-2 text-ink-400 hover:bg-outflow-50 hover:text-outflow-600"
                      @click="handleDelete(item.id)"
                    >
                      <Trash2 :size="17" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Kartu (layar kecil) -->
        <ul class="divide-y divide-ink-100 md:hidden">
          <li v-for="item in cashFlows" :key="item.id" :data-testid="`card-${item.id}`" class="space-y-3 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-ink-900">{{ item.label }}</p>
                <p class="mt-0.5 line-clamp-2 text-xs text-ink-400">{{ item.description }}</p>
              </div>
              <span
                class="shrink-0 font-bold tabular-nums"
                :class="item.type === 'inflow' ? 'text-inflow-600' : 'text-outflow-600'"
              >
                {{ item.type === "inflow" ? "+" : "-" }} {{ formatRupiah(item.nominal) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs text-ink-500">
                {{ TYPE_LABELS[item.type] }} &middot; {{ SOURCE_LABELS[item.source] }} &middot;
                {{ formatShortDate(item.created_at) }}
              </p>
              <div class="flex gap-1">
                <RouterLink
                  :to="`/cash-flows/${item.id}`"
                  aria-label="Lihat detail"
                  class="rounded-lg p-2 text-ink-400 hover:bg-ink-100"
                >
                  <Eye :size="17" />
                </RouterLink>
                <button
                  type="button"
                  :data-testid="`card-edit-btn-${item.id}`"
                  aria-label="Ubah"
                  class="rounded-lg p-2 text-ink-400 hover:bg-ink-100"
                  @click="handleEdit(item.id)"
                >
                  <Pencil :size="17" />
                </button>
                <button
                  type="button"
                  :data-testid="`card-delete-btn-${item.id}`"
                  aria-label="Hapus"
                  class="rounded-lg p-2 text-ink-400 hover:bg-outflow-50 hover:text-outflow-600"
                  @click="handleDelete(item.id)"
                >
                  <Trash2 :size="17" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </template>
    </section>

    <AddModal :show="showAddModal" @close="showAddModal = false" @saved="refreshAll" />
    <ChangeModal
      :show="showChangeModal"
      :cash-flow-id="selectedId"
      @close="showChangeModal = false"
      @saved="refreshAll"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Eye,
  Filter,
  HandCoins,
  Inbox,
  LoaderCircle,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { SOURCE_LABELS, TYPE_LABELS, type CashFlowQueryParams } from "../api/cashFlowApi";
import { formatRupiah, formatShortDate, showConfirmDialog } from "../../../helpers/toolsHelper";

const cashFlowsStore = useCashFlowsStore();

const stats = computed(() => cashFlowsStore.stats);
const cashFlows = computed(() => cashFlowsStore.cashFlows);

const loading = ref(false);
const showAddModal = ref(false);
const showChangeModal = ref(false);
const selectedId = ref<number | string | null>(null);
const trendMode = ref<"daily" | "monthly">("daily");

const filters = reactive<Required<CashFlowQueryParams>>({
  type: "",
  source: "",
  label: "",
  start_date: "",
  end_date: "",
});

const hasFilters = computed(() => Object.values(filters).some(Boolean));

const sourceCards = computed(() => [
  { key: "cash", label: "Saldo kas tunai", value: stats.value.cash, icon: Banknote, tone: "bg-inflow-50 text-inflow-600" },
  { key: "savings", label: "Saldo tabungan", value: stats.value.savings, icon: PiggyBank, tone: "bg-sky-50 text-sky-600" },
  { key: "loans", label: "Saldo pinjaman", value: stats.value.loans, icon: HandCoins, tone: "bg-violet-50 text-violet-600" },
]);

const flowShare = computed(() => {
  const total = stats.value.total_inflow + stats.value.total_outflow;
  if (total === 0) return { inflow: 0, outflow: 0 };
  const inflow = Math.round((stats.value.total_inflow / total) * 100);
  return { inflow, outflow: 100 - inflow };
});

const flowAriaLabel = computed(
  () => `Pemasukan ${flowShare.value.inflow} persen, pengeluaran ${flowShare.value.outflow} persen`
);

const trendRows = computed(() => {
  const source = trendMode.value === "daily" ? cashFlowsStore.statsDaily : cashFlowsStore.statsMonthly;
  if (!source) return [];

  const keys = Object.keys(source.stats_inflow);
  const max = Math.max(1, ...keys.flatMap((key) => [source.stats_inflow[key] || 0, source.stats_outflow[key] || 0]));

  return keys.map((key) => {
    const inflow = source.stats_inflow[key] || 0;
    const outflow = source.stats_outflow[key] || 0;
    return {
      key,
      label: trendMode.value === "daily" ? key.slice(0, 5).replace("-", "/") : key.replace("-", "/"),
      inflow,
      outflow,
      inflowPct: Math.round((inflow / max) * 100),
      outflowPct: Math.round((outflow / max) * 100),
    };
  });
});

async function loadCashFlows() {
  loading.value = true;
  await cashFlowsStore.asyncSetCashFlows({ ...filters });
  loading.value = false;
}

function loadTrend() {
  return trendMode.value === "daily"
    ? cashFlowsStore.asyncSetStatsDaily({ total_data: 7 })
    : cashFlowsStore.asyncSetStatsMonthly({ total_data: 6 });
}

function refreshAll() {
  loadCashFlows();
  loadTrend();
  cashFlowsStore.asyncSetLabels();
}

function clearFilters() {
  filters.type = "";
  filters.source = "";
  filters.label = "";
  filters.start_date = "";
  filters.end_date = "";
}

onMounted(() => {
  refreshAll();
});

watch(filters, loadCashFlows);
watch(trendMode, loadTrend);

watch(
  () => cashFlowsStore.isCashFlowDeleted,
  (deleted) => {
    if (!deleted) return;
    cashFlowsStore.setIsCashFlowDeleted(false);
    refreshAll();
  }
);

watch(
  () => cashFlowsStore.isCashFlowDeletedAll,
  (deleted) => {
    if (!deleted) return;
    cashFlowsStore.setIsCashFlowDeletedAll(false);
    refreshAll();
  }
);

function handleEdit(id: number | string) {
  selectedId.value = id;
  showChangeModal.value = true;
}

async function handleDelete(id: number | string) {
  const result = await showConfirmDialog("Transaksi ini akan dihapus permanen. Lanjutkan?");
  if (result.isConfirmed) {
    cashFlowsStore.asyncSetIsCashFlowDelete(id);
  }
}

async function handleDeleteAll() {
  const result = await showConfirmDialog(
    "Seluruh transaksi Anda akan dihapus permanen dan tidak bisa dikembalikan. Lanjutkan?"
  );
  if (result.isConfirmed) {
    cashFlowsStore.asyncSetIsCashFlowDeleteAll();
  }
}
</script>
