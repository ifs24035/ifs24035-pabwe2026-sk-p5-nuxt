<template>
  <div class="space-y-5">
    <fieldset>
      <legend class="field-label">Jenis arus kas</legend>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="type-inflow"
          :aria-pressed="form.type === 'inflow'"
          class="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
          :class="
            form.type === 'inflow'
              ? 'border-inflow-500 bg-inflow-50 text-inflow-700'
              : 'border-ink-200 bg-white text-ink-500 hover:bg-ink-50'
          "
          @click="form.type = 'inflow'"
        >
          <ArrowDownLeft :size="17" />
          Pemasukan
        </button>
        <button
          type="button"
          data-testid="type-outflow"
          :aria-pressed="form.type === 'outflow'"
          class="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
          :class="
            form.type === 'outflow'
              ? 'border-outflow-500 bg-outflow-50 text-outflow-700'
              : 'border-ink-200 bg-white text-ink-500 hover:bg-ink-50'
          "
          @click="form.type = 'outflow'"
        >
          <ArrowUpRight :size="17" />
          Pengeluaran
        </button>
      </div>
    </fieldset>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="cash-flow-source" class="field-label">Sumber dana</label>
        <select id="cash-flow-source" v-model="form.source" data-testid="source-select" class="field">
          <option value="cash">Tunai</option>
          <option value="savings">Tabungan</option>
          <option value="loans">Pinjaman</option>
        </select>
      </div>

      <div>
        <label for="cash-flow-label" class="field-label">Label kategori</label>
        <input
          id="cash-flow-label"
          v-model="form.label"
          data-testid="label-input"
          type="text"
          list="cash-flow-label-options"
          placeholder="Contoh: gaji, makan, transport"
          class="field"
        />
        <datalist id="cash-flow-label-options">
          <option v-for="label in labels" :key="label" :value="label" />
        </datalist>
      </div>
    </div>

    <div>
      <label for="cash-flow-nominal" class="field-label">Nominal</label>
      <div class="relative">
        <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-400">
          Rp
        </span>
        <input
          id="cash-flow-nominal"
          v-model="form.nominal"
          data-testid="nominal-input"
          type="number"
          min="1"
          inputmode="numeric"
          placeholder="0"
          class="field pl-10 font-semibold tabular-nums"
        />
      </div>
      <p class="mt-1.5 text-xs text-ink-400" data-testid="nominal-preview">
        {{ formatRupiah(form.nominal) }}
      </p>
    </div>

    <div>
      <label for="cash-flow-description" class="field-label">Keterangan</label>
      <textarea
        id="cash-flow-description"
        v-model="form.description"
        data-testid="description-input"
        rows="3"
        placeholder="Tulis catatan singkat tentang transaksi ini"
        class="field resize-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownLeft, ArrowUpRight } from "lucide-vue-next";
import type { CashFlowFormValues } from "../api/cashFlowApi";
import { formatRupiah } from "../../../helpers/toolsHelper";

interface CashFlowFormProps {
  form: CashFlowFormValues;
  labels?: string[];
}

withDefaults(defineProps<CashFlowFormProps>(), {
  labels: () => [],
});
</script>
