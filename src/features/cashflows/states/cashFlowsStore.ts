import { defineStore } from "pinia";
import cashFlowApi, {
  emptyStats,
  type CashFlow,
  type CashFlowPayload,
  type CashFlowQueryParams,
  type CashFlowStats,
  type CashFlowTrend,
  type CashFlowTrendParams,
} from "../api/cashFlowApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export type { CashFlow, CashFlowQueryParams, CashFlowStats, CashFlowTrend };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: CashFlowTrend | null;
  statsMonthly: CashFlowTrend | null;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    setCashFlows(cashFlows: CashFlow[]) {
      this.cashFlows = cashFlows;
    },
    setCashFlow(cashFlow: CashFlow | null) {
      this.cashFlow = cashFlow;
    },
    setStats(stats: CashFlowStats) {
      this.stats = stats;
    },
    setLabels(labels: string[]) {
      this.labels = labels;
    },
    setStatsDaily(stats: CashFlowTrend | null) {
      this.statsDaily = stats;
    },
    setStatsMonthly(stats: CashFlowTrend | null) {
      this.statsMonthly = stats;
    },
    setIsCashFlowAdd(status: boolean) {
      this.isCashFlowAdd = status;
    },
    setIsCashFlowAdded(status: boolean) {
      this.isCashFlowAdded = status;
    },
    setIsCashFlowChange(status: boolean) {
      this.isCashFlowChange = status;
    },
    setIsCashFlowChanged(status: boolean) {
      this.isCashFlowChanged = status;
    },
    setIsCashFlowDelete(status: boolean) {
      this.isCashFlowDelete = status;
    },
    setIsCashFlowDeleted(status: boolean) {
      this.isCashFlowDeleted = status;
    },
    setIsCashFlowDeleteAll(status: boolean) {
      this.isCashFlowDeleteAll = status;
    },
    setIsCashFlowDeletedAll(status: boolean) {
      this.isCashFlowDeletedAll = status;
    },

    async asyncSetCashFlows(params: CashFlowQueryParams = {}) {
      try {
        const result = await cashFlowApi.getCashFlows(params);
        this.setCashFlows(result.cashFlows);
        this.setStats(result.stats);
      } catch {
        this.setCashFlows([]);
        this.setStats(emptyStats());
      }
    },
    async asyncSetCashFlow(id: number | string) {
      try {
        this.setCashFlow(await cashFlowApi.getCashFlowById(id));
      } catch {
        this.setCashFlow(null);
      }
    },
    async asyncSetLabels() {
      try {
        this.setLabels(await cashFlowApi.getLabels());
      } catch {
        this.setLabels([]);
      }
    },
    async asyncSetStatsDaily(params: CashFlowTrendParams = {}) {
      try {
        this.setStatsDaily(await cashFlowApi.getStatsDaily(params));
      } catch {
        this.setStatsDaily(null);
      }
    },
    async asyncSetStatsMonthly(params: CashFlowTrendParams = {}) {
      try {
        this.setStatsMonthly(await cashFlowApi.getStatsMonthly(params));
      } catch {
        this.setStatsMonthly(null);
      }
    },
    async asyncSetIsCashFlowAdd(payload: CashFlowPayload) {
      try {
        await cashFlowApi.postCashFlow(payload);
        showSuccessDialog("Transaksi berhasil dicatat.");
        this.setIsCashFlowAdded(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCashFlowAdded(false);
      } finally {
        this.setIsCashFlowAdd(true);
      }
    },
    async asyncSetIsCashFlowChange(id: number | string, payload: CashFlowPayload) {
      try {
        await cashFlowApi.putCashFlow(id, payload);
        showSuccessDialog("Transaksi berhasil diperbarui.");
        this.setIsCashFlowChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCashFlowChanged(false);
      } finally {
        this.setIsCashFlowChange(true);
      }
    },
    async asyncSetIsCashFlowDelete(id: number | string) {
      try {
        await cashFlowApi.deleteCashFlow(id);
        showSuccessDialog("Transaksi berhasil dihapus.");
        this.setIsCashFlowDeleted(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCashFlowDeleted(false);
      } finally {
        this.setIsCashFlowDelete(true);
      }
    },
    async asyncSetIsCashFlowDeleteAll() {
      try {
        await cashFlowApi.deleteAllCashFlows();
        showSuccessDialog("Seluruh transaksi berhasil dihapus.");
        this.setIsCashFlowDeletedAll(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCashFlowDeletedAll(false);
      } finally {
        this.setIsCashFlowDeleteAll(true);
      }
    },
  },
});
