import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import cashFlowApi, { emptyStats } from "../api/cashFlowApi";
import { renderWithProviders } from "../../../test-utils";
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
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const inflow = {
  id: 1,
  type: "inflow" as const,
  source: "cash" as const,
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
  created_at: "2024-10-05T11:26:45.000000Z",
  updated_at: "2024-10-05T11:26:48.000000Z",
};
const outflow = {
  id: 2,
  type: "outflow" as const,
  source: "savings" as const,
  label: "alat-elektronik",
  description: "Keyboard dan mouse",
  nominal: 400000,
  created_at: "2024-10-05T12:09:16.000000Z",
  updated_at: "2024-10-05T12:09:16.000000Z",
};
const stats = {
  cashflow: 2100000,
  total_inflow: 2500000,
  total_outflow: 400000,
  cash: 2500000,
  savings: -400000,
  loans: 0,
};
const daily = {
  stats_inflow: { "04-10-2024": 0, "05-10-2024": 2500000 },
  stats_outflow: { "05-10-2024": 400000 },
  stats_cashflow: {},
};
const monthly = {
  stats_inflow: { "09-2024": 100, "10-2024": 2500000 },
  stats_outflow: { "09-2024": 0, "10-2024": 400000 },
  stats_cashflow: {},
};

const money = (text: string) => text.replace(/\s/g, " ");
const confirm = (isConfirmed: boolean) =>
  vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce({ isConfirmed } as any);

async function mountPage() {
  const result = renderWithProviders(HomePage);
  await flushPromises();
  return result;
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cashFlowApi.getCashFlows).mockResolvedValue({ cashFlows: [inflow, outflow], stats });
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue(["gaji", "alat-elektronik"]);
    vi.mocked(cashFlowApi.getStatsDaily).mockResolvedValue(daily);
    vi.mocked(cashFlowApi.getStatsMonthly).mockResolvedValue(monthly);
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValue(inflow);
    vi.mocked(cashFlowApi.deleteCashFlow).mockResolvedValue("ok");
    vi.mocked(cashFlowApi.deleteAllCashFlows).mockResolvedValue("ok");
    vi.mocked(cashFlowApi.postCashFlow).mockResolvedValue({ cash_flow_id: 3 });
  });

  describe("ringkasan saldo", () => {
    it("menampilkan seluruh kartu metrik keuangan", async () => {
      const { wrapper } = await mountPage();

      expect(money(wrapper.get('[data-testid="stat-cashflow"]').text())).toBe("Rp 2.100.000");
      expect(money(wrapper.get('[data-testid="stat-inflow"]').text())).toBe("Rp 2.500.000");
      expect(money(wrapper.get('[data-testid="stat-outflow"]').text())).toBe("Rp 400.000");
      expect(money(wrapper.get('[data-testid="stat-cash"]').text())).toBe("Rp 2.500.000");
      expect(money(wrapper.get('[data-testid="stat-savings"]').text())).toContain("400.000");
      expect(money(wrapper.get('[data-testid="stat-loans"]').text())).toBe("Rp 0");
      expect(wrapper.get('[data-testid="stat-cashflow"]').classes()).toContain("text-white");
    });

    it("menghitung proporsi pemasukan dan pengeluaran pada bar", async () => {
      const { wrapper } = await mountPage();

      expect(wrapper.get('[data-testid="flow-bar-inflow"]').attributes("style")).toContain("86%");
      expect(wrapper.get('[data-testid="flow-bar-outflow"]').attributes("style")).toContain("14%");
      expect(wrapper.get('[role="img"]').attributes("aria-label")).toBe("Pemasukan 86 persen, pengeluaran 14 persen");
    });

    it("menandai saldo negatif dan bar kosong saat belum ada transaksi", async () => {
      vi.mocked(cashFlowApi.getCashFlows).mockResolvedValue({
        cashFlows: [],
        stats: { ...emptyStats(), cashflow: -5000 },
      });
      const { wrapper } = await mountPage();

      expect(wrapper.get('[data-testid="stat-cashflow"]').classes()).toContain("text-outflow-400");
      expect(wrapper.get('[data-testid="flow-bar-inflow"]').attributes("style")).toContain("0%");
      expect(wrapper.get('[data-testid="flow-bar-outflow"]').attributes("style")).toContain("0%");
    });
  });

  describe("daftar transaksi", () => {
    it("menampilkan baris tabel dan kartu untuk tiap transaksi", async () => {
      const { wrapper } = await mountPage();

      expect(wrapper.get('[data-testid="total-count"]').text()).toBe("2 transaksi");

      const row1 = wrapper.get('[data-testid="row-1"]');
      expect(row1.text()).toContain("gaji");
      expect(row1.text()).toContain("Pemasukan");
      expect(row1.text()).toContain("Tunai");
      expect(money(row1.text())).toContain("+ Rp 2.500.000");

      const row2 = wrapper.get('[data-testid="row-2"]');
      expect(row2.text()).toContain("Pengeluaran");
      expect(row2.text()).toContain("Tabungan");
      expect(money(row2.text())).toContain("- Rp 400.000");

      expect(wrapper.get('[data-testid="card-1"]').text()).toContain("Gaji bulanan");
      expect(money(wrapper.get('[data-testid="card-2"]').text())).toContain("- Rp 400.000");
      expect(wrapper.get('[data-testid="detail-btn-1"]').attributes("href")).toBe("/cash-flows/1");
    });

    it("menampilkan status memuat selama data diambil", async () => {
      let resolveRequest!: (value: any) => void;
      vi.mocked(cashFlowApi.getCashFlows).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );
      const { wrapper } = renderWithProviders(HomePage);
      await flushPromises();
      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true);

      resolveRequest({ cashFlows: [inflow], stats });
      await flushPromises();
      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="row-1"]').exists()).toBe(true);
    });

    it("menampilkan keadaan kosong tanpa filter", async () => {
      vi.mocked(cashFlowApi.getCashFlows).mockResolvedValue({ cashFlows: [], stats: emptyStats() });
      const { wrapper } = await mountPage();

      expect(wrapper.get('[data-testid="empty-state"]').text()).toContain("Belum ada transaksi tercatat.");
      expect(wrapper.find('[data-testid="clear-filters-btn"]').exists()).toBe(false);
    });

    it("menampilkan keadaan kosong saat filter tidak cocok", async () => {
      const { wrapper } = await mountPage();
      vi.mocked(cashFlowApi.getCashFlows).mockResolvedValue({ cashFlows: [], stats: emptyStats() });

      await wrapper.get('[data-testid="filter-label"]').setValue("gaji");
      await flushPromises();

      expect(wrapper.get('[data-testid="empty-state"]').text()).toContain("Tidak ada transaksi yang cocok dengan filter.");
    });
  });

  describe("filter", () => {
    it("memuat ulang data dengan parameter filter", async () => {
      const { wrapper } = await mountPage();
      expect(cashFlowApi.getCashFlows).toHaveBeenLastCalledWith({
        type: "",
        source: "",
        label: "",
        start_date: "",
        end_date: "",
      });

      await wrapper.get('[data-testid="filter-type"]').setValue("inflow");
      await wrapper.get('[data-testid="filter-source"]').setValue("cash");
      await wrapper.get('[data-testid="filter-label"]').setValue("gaji");
      await wrapper.get('[data-testid="filter-start"]').setValue("2024-10-01");
      await wrapper.get('[data-testid="filter-end"]').setValue("2024-10-31");
      await flushPromises();

      expect(cashFlowApi.getCashFlows).toHaveBeenLastCalledWith({
        type: "inflow",
        source: "cash",
        label: "gaji",
        start_date: "2024-10-01",
        end_date: "2024-10-31",
      });
    });

    it("menghapus seluruh filter", async () => {
      const { wrapper } = await mountPage();
      await wrapper.get('[data-testid="filter-type"]').setValue("outflow");
      await flushPromises();

      await wrapper.get('[data-testid="clear-filters-btn"]').trigger("click");
      await flushPromises();

      expect((wrapper.get('[data-testid="filter-type"]').element as HTMLSelectElement).value).toBe("");
      expect(wrapper.find('[data-testid="clear-filters-btn"]').exists()).toBe(false);
      expect(cashFlowApi.getCashFlows).toHaveBeenLastCalledWith(expect.objectContaining({ type: "" }));
    });
  });

  describe("tren", () => {
    it("menampilkan tren harian lalu berpindah ke bulanan", async () => {
      const { wrapper } = await mountPage();

      expect(cashFlowApi.getStatsDaily).toHaveBeenCalledWith({ total_data: 7 });
      expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain("05/10");
      expect(wrapper.get('[data-testid="trend-daily"]').classes()).toContain("bg-white");

      await wrapper.get('[data-testid="trend-monthly"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.getStatsMonthly).toHaveBeenCalledWith({ total_data: 6 });
      expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain("10/2024");
      expect(wrapper.get('[data-testid="trend-monthly"]').classes()).toContain("bg-white");

      await wrapper.get('[data-testid="trend-daily"]').trigger("click");
      await flushPromises();
      expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain("04/10");
    });

    it("menampilkan pesan kosong jika data tren tidak tersedia", async () => {
      vi.mocked(cashFlowApi.getStatsDaily).mockRejectedValue(new Error("x"));
      const { wrapper } = await mountPage();

      expect(wrapper.get('[data-testid="trend-empty"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="trend-chart"]').exists()).toBe(false);
    });
  });

  describe("aksi", () => {
    it("menghapus transaksi dari tabel setelah dikonfirmasi lalu memuat ulang", async () => {
      confirm(true);
      const { wrapper } = await mountPage();
      const callsBefore = vi.mocked(cashFlowApi.getCashFlows).mock.calls.length;

      await wrapper.get('[data-testid="delete-btn-1"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.deleteCashFlow).toHaveBeenCalledWith(1);
      expect(vi.mocked(cashFlowApi.getCashFlows).mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("menghapus transaksi dari kartu setelah dikonfirmasi", async () => {
      confirm(true);
      const { wrapper } = await mountPage();

      await wrapper.get('[data-testid="card-delete-btn-2"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.deleteCashFlow).toHaveBeenCalledWith(2);
    });

    it("membatalkan penghapusan jika tidak dikonfirmasi", async () => {
      confirm(false);
      const { wrapper } = await mountPage();

      await wrapper.get('[data-testid="delete-btn-1"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.deleteCashFlow).not.toHaveBeenCalled();
    });

    it("mereset seluruh transaksi setelah dikonfirmasi lalu memuat ulang", async () => {
      confirm(true);
      const { wrapper } = await mountPage();
      const callsBefore = vi.mocked(cashFlowApi.getCashFlows).mock.calls.length;

      await wrapper.get('[data-testid="reset-all-btn"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.deleteAllCashFlows).toHaveBeenCalled();
      expect(vi.mocked(cashFlowApi.getCashFlows).mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("tidak mereset jika dialog dibatalkan", async () => {
      confirm(false);
      const { wrapper } = await mountPage();

      await wrapper.get('[data-testid="reset-all-btn"]').trigger("click");
      await flushPromises();

      expect(cashFlowApi.deleteAllCashFlows).not.toHaveBeenCalled();
    });

    it("membuka modal ubah dari tabel dan kartu", async () => {
      const { wrapper } = await mountPage();
      expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);

      await wrapper.get('[data-testid="edit-btn-1"]').trigger("click");
      await flushPromises();
      expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(true);
      expect(cashFlowApi.getCashFlowById).toHaveBeenCalledWith(1);

      await wrapper.get('[data-testid="close-change-modal-btn"]').trigger("click");
      expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);

      await wrapper.get('[data-testid="card-edit-btn-2"]').trigger("click");
      await flushPromises();
      expect(cashFlowApi.getCashFlowById).toHaveBeenLastCalledWith(2);
    });

    it("memuat ulang data setelah perubahan transaksi disimpan", async () => {
      vi.mocked(cashFlowApi.putCashFlow).mockResolvedValue("ok");
      const { wrapper } = await mountPage();
      const callsBefore = vi.mocked(cashFlowApi.getCashFlows).mock.calls.length;

      await wrapper.get('[data-testid="edit-btn-1"]').trigger("click");
      await flushPromises();
      await wrapper.get("[data-testid='change-cash-flow-modal'] form").trigger("submit");
      await flushPromises();

      expect(cashFlowApi.putCashFlow).toHaveBeenCalled();
      expect(vi.mocked(cashFlowApi.getCashFlows).mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it("mencatat transaksi baru lewat modal lalu memuat ulang data", async () => {
      const { wrapper } = await mountPage();
      const callsBefore = vi.mocked(cashFlowApi.getCashFlows).mock.calls.length;

      await wrapper.get('[data-testid="add-cash-flow-btn"]').trigger("click");
      await flushPromises();
      expect(wrapper.find('[data-testid="add-cash-flow-modal"]').exists()).toBe(true);

      await wrapper.get('[data-testid="label-input"]').setValue("bonus");
      await wrapper.get('[data-testid="nominal-input"]').setValue("100000");
      await wrapper.get('[data-testid="description-input"]').setValue("Bonus proyek");
      await wrapper.get("[data-testid='add-cash-flow-modal'] form").trigger("submit");
      await flushPromises();

      expect(cashFlowApi.postCashFlow).toHaveBeenCalledWith(expect.objectContaining({ label: "bonus", nominal: 100000 }));
      expect(wrapper.find('[data-testid="add-cash-flow-modal"]').exists()).toBe(false);
      expect(vi.mocked(cashFlowApi.getCashFlows).mock.calls.length).toBeGreaterThan(callsBefore);

      await wrapper.get('[data-testid="add-cash-flow-btn"]').trigger("click");
      await wrapper.get('[data-testid="close-add-modal-btn"]').trigger("click");
      expect(wrapper.find('[data-testid="add-cash-flow-modal"]').exists()).toBe(false);
    });
  });
});
