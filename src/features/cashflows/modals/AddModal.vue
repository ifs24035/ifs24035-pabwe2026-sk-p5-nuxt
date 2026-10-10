<template>
  <div
    v-if="show"
    data-testid="add-cash-flow-modal"
    class="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 sm:items-center sm:p-6"
    @click.self="onClose"
  >
    <form
      class="flex max-h-full w-full max-w-lg animate-pop flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      @submit.prevent="handleSave"
    >
      <header class="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
        <div>
          <h3 class="text-lg font-bold text-ink-900">Catat transaksi baru</h3>
          <p class="mt-0.5 text-sm text-ink-500">Isi detail uang masuk atau uang keluar.</p>
        </div>
        <button
          type="button"
          data-testid="close-add-modal-btn"
          aria-label="Tutup"
          class="rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          @click="onClose"
        >
          <X :size="20" />
        </button>
      </header>

      <div class="overflow-y-auto px-6 py-5">
        <CashFlowForm :form="form" :labels="cashFlowsStore.labels" />
      </div>

      <footer class="flex items-center justify-end gap-3 border-t border-ink-100 bg-ink-50/60 px-6 py-4">
        <button type="button" data-testid="cancel-add-modal-btn" :disabled="loading" class="btn-ghost" @click="onClose">
          Batal
        </button>
        <button type="submit" data-testid="submit-add-modal-btn" :disabled="loading" class="btn-primary">
          <LoaderCircle v-if="loading" :size="18" class="animate-spin" />
          <Plus v-else :size="18" />
          <span>{{ loading ? "Menyimpan..." : "Simpan transaksi" }}</span>
        </button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Plus, X, LoaderCircle } from "lucide-vue-next";
import CashFlowForm from "../components/CashFlowForm.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { emptyForm, toPayload, validateForm } from "../api/cashFlowApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

interface AddModalProps {
  show?: boolean;
}

const props = withDefaults(defineProps<AddModalProps>(), {
  show: false,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const cashFlowsStore = useCashFlowsStore();

const loading = ref(false);
const form = reactive(emptyForm());

function onClose() {
  emit("close");
}

watch(
  () => props.show,
  (show) => {
    document.body.style.overflow = show ? "hidden" : "";
    if (show) cashFlowsStore.asyncSetLabels();
  }
);

watch(
  () => cashFlowsStore.isCashFlowAdd,
  (isAdd) => {
    if (!isAdd) return;
    loading.value = false;
    cashFlowsStore.setIsCashFlowAdd(false);

    if (cashFlowsStore.isCashFlowAdded) {
      cashFlowsStore.setIsCashFlowAdded(false);
      Object.assign(form, emptyForm());
      emit("saved");
      onClose();
    }
  }
);

function handleSave() {
  const error = validateForm(form);
  if (error) {
    showErrorDialog(error);
    return;
  }

  loading.value = true;
  cashFlowsStore.asyncSetIsCashFlowAdd(toPayload(form));
}
</script>
