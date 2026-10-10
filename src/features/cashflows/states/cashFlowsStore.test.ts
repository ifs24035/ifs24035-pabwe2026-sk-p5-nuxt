import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCashFlowsStore } from "./cashFlowsStore";
import cashFlowApi, { emptyStats } from "../api/cashFlowApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/cashFlowApi")>();
  return {
    ...actual,
    default: {
      getCashFlows: vi.fn(),
      getCashFlowById: vi.fn(),
      postCashFlow: vi.fn(),
      putCashFlow: vi.fn(),
      deleteCashFlow: vi.fn(),
      deleteAllCashFlows: vi.fn(),
      getLabels: vi.fn(),
      getStatsDaily: vi.fn(),
      getStatsMonthly: vi.fn(),
    },
  };
});
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

const payload = { type: "inflow", source: "cash", label: "gaji", description: "x", nominal: 1 } as const;
const item = { id: 1, ...payload };
const trend = { stats_inflow: { a: 1 }, stats_outflow: {}, stats_cashflow: {} };

describe("cashFlowsStore", () => {
  let store: ReturnType<typeof useCashFlowsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCashFlowsStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal yang benar", () => {
    expect(store.cashFlows).toEqual([]);
    expect(store.cashFlow).toBeNull();
    expect(store.stats).toEqual(emptyStats());
    expect(store.labels).toEqual([]);
    expect(store.statsDaily).toBeNull();
    expect(store.statsMonthly).toBeNull();
    expect(store.isCashFlowAdd).toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(false);
  });

  it("memperbarui state lewat setter", () => {
    store.setCashFlows([item]);
    store.setCashFlow(item);
    store.setStats({ ...emptyStats(), cashflow: 5 });
    store.setLabels(["gaji"]);
    store.setStatsDaily(trend);
    store.setStatsMonthly(trend);
    store.setIsCashFlowAdd(true);
    store.setIsCashFlowAdded(true);
    store.setIsCashFlowChange(true);
    store.setIsCashFlowChanged(true);
    store.setIsCashFlowDelete(true);
    store.setIsCashFlowDeleted(true);
    store.setIsCashFlowDeleteAll(true);
    store.setIsCashFlowDeletedAll(true);

    expect(store.cashFlows).toEqual([item]);
    expect(store.cashFlow).toEqual(item);
    expect(store.stats.cashflow).toBe(5);
    expect(store.labels).toEqual(["gaji"]);
    expect(store.statsDaily).toEqual(trend);
    expect(store.statsMonthly).toEqual(trend);
    expect(
      [
        store.isCashFlowAdd,
        store.isCashFlowAdded,
        store.isCashFlowChange,
        store.isCashFlowChanged,
        store.isCashFlowDelete,
        store.isCashFlowDeleted,
        store.isCashFlowDeleteAll,
        store.isCashFlowDeletedAll,
      ].every(Boolean)
    ).toBe(true);
  });

  it("asyncSetCashFlows berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.getCashFlows).mockResolvedValueOnce({
      cashFlows: [item],
      stats: { ...emptyStats(), cashflow: 9 },
    });
    await store.asyncSetCashFlows({ type: "inflow" });
    expect(store.cashFlows).toEqual([item]);
    expect(store.stats.cashflow).toBe(9);

    vi.mocked(cashFlowApi.getCashFlows).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetCashFlows();
    expect(store.cashFlows).toEqual([]);
    expect(store.stats).toEqual(emptyStats());
  });

  it("asyncSetCashFlow berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValueOnce(item);
    await store.asyncSetCashFlow(1);
    expect(store.cashFlow).toEqual(item);

    vi.mocked(cashFlowApi.getCashFlowById).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetCashFlow(2);
    expect(store.cashFlow).toBeNull();
  });

  it("asyncSetLabels berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.getLabels).mockResolvedValueOnce(["gaji"]);
    await store.asyncSetLabels();
    expect(store.labels).toEqual(["gaji"]);

    vi.mocked(cashFlowApi.getLabels).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetLabels();
    expect(store.labels).toEqual([]);
  });

  it("asyncSetStatsDaily dan asyncSetStatsMonthly berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.getStatsDaily).mockResolvedValueOnce(trend);
    vi.mocked(cashFlowApi.getStatsMonthly).mockResolvedValueOnce(trend);
    await store.asyncSetStatsDaily({ total_data: 7 });
    await store.asyncSetStatsMonthly({ total_data: 6 });
    expect(store.statsDaily).toEqual(trend);
    expect(store.statsMonthly).toEqual(trend);

    vi.mocked(cashFlowApi.getStatsDaily).mockRejectedValueOnce(new Error("x"));
    vi.mocked(cashFlowApi.getStatsMonthly).mockRejectedValueOnce(new Error("x"));
    await store.asyncSetStatsDaily();
    await store.asyncSetStatsMonthly();
    expect(store.statsDaily).toBeNull();
    expect(store.statsMonthly).toBeNull();
  });

  it("asyncSetIsCashFlowAdd berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.postCashFlow).mockResolvedValueOnce({ cash_flow_id: 1 });
    await store.asyncSetIsCashFlowAdd(payload);
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalled();
    expect(store.isCashFlowAdded).toBe(true);
    expect(store.isCashFlowAdd).toBe(true);

    vi.mocked(cashFlowApi.postCashFlow).mockRejectedValueOnce(new Error("Gagal tambah"));
    await store.asyncSetIsCashFlowAdd(payload);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal tambah");
    expect(store.isCashFlowAdded).toBe(false);
  });

  it("asyncSetIsCashFlowChange berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.putCashFlow).mockResolvedValueOnce("ok");
    await store.asyncSetIsCashFlowChange(1, payload);
    expect(store.isCashFlowChanged).toBe(true);
    expect(store.isCashFlowChange).toBe(true);

    vi.mocked(cashFlowApi.putCashFlow).mockRejectedValueOnce(new Error("Gagal ubah"));
    await store.asyncSetIsCashFlowChange(1, payload);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal ubah");
    expect(store.isCashFlowChanged).toBe(false);
  });

  it("asyncSetIsCashFlowDelete berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.deleteCashFlow).mockResolvedValueOnce("ok");
    await store.asyncSetIsCashFlowDelete(1);
    expect(store.isCashFlowDeleted).toBe(true);
    expect(store.isCashFlowDelete).toBe(true);

    vi.mocked(cashFlowApi.deleteCashFlow).mockRejectedValueOnce(new Error("Gagal hapus"));
    await store.asyncSetIsCashFlowDelete(1);
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
    expect(store.isCashFlowDeleted).toBe(false);
  });

  it("asyncSetIsCashFlowDeleteAll berhasil dan gagal", async () => {
    vi.mocked(cashFlowApi.deleteAllCashFlows).mockResolvedValueOnce("ok");
    await store.asyncSetIsCashFlowDeleteAll();
    expect(store.isCashFlowDeletedAll).toBe(true);
    expect(store.isCashFlowDeleteAll).toBe(true);

    vi.mocked(cashFlowApi.deleteAllCashFlows).mockRejectedValueOnce(new Error("Gagal reset"));
    await store.asyncSetIsCashFlowDeleteAll();
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal reset");
    expect(store.isCashFlowDeletedAll).toBe(false);
  });
});
