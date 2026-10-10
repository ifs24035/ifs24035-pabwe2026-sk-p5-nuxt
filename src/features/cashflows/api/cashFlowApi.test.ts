import { describe, it, expect, vi, beforeEach } from "vitest";
import cashFlowApi, {
  buildQuery,
  emptyForm,
  emptyStats,
  normalizeStats,
  toPayload,
  validateForm,
} from "./cashFlowApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body } as any);
}

const payload = {
  type: "inflow" as const,
  source: "cash" as const,
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
};

describe("helper cashFlowApi", () => {
  it("emptyStats mengembalikan nol", () => {
    expect(emptyStats()).toEqual({ cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 });
  });

  it("normalizeStats menghitung saldo bersih per sumber dana", () => {
    expect(
      normalizeStats({
        cashflow: 2000000,
        total_inflow: 2500000,
        total_outflow: 500000,
        total_inflow_cash: 2500000,
        total_outflow_cash: 100000,
        total_outflow_savings: 400000,
        total_inflow_loans: 50000,
      })
    ).toEqual({
      cashflow: 2000000,
      total_inflow: 2500000,
      total_outflow: 500000,
      cash: 2400000,
      savings: -400000,
      loans: 50000,
    });
  });

  it("normalizeStats aman terhadap data kosong", () => {
    expect(normalizeStats(undefined)).toEqual(emptyStats());
    expect(normalizeStats(null)).toEqual(emptyStats());
  });

  it("buildQuery menyaring nilai kosong", () => {
    expect(buildQuery()).toBe("");
    expect(buildQuery({ a: "", b: undefined, c: null })).toBe("");
    expect(buildQuery({ type: "inflow", total_data: 7 })).toBe("?type=inflow&total_data=7");
  });

  it("validateForm memeriksa label, nominal, dan keterangan", () => {
    const form = emptyForm();
    expect(validateForm(form)).toBe("Label tidak boleh kosong");
    form.label = "gaji";
    expect(validateForm(form)).toBe("Nominal harus lebih besar dari 0");
    form.nominal = "-5";
    expect(validateForm(form)).toBe("Nominal harus lebih besar dari 0");
    form.nominal = "1000";
    expect(validateForm(form)).toBe("Keterangan tidak boleh kosong");
    form.description = "Catatan";
    expect(validateForm(form)).toBeNull();
  });

  it("toPayload merapikan dan mengubah nominal menjadi angka", () => {
    expect(
      toPayload({ type: "outflow", source: "loans", label: " makan ", nominal: "15000", description: " siang " })
    ).toEqual({ type: "outflow", source: "loans", label: "makan", nominal: 15000, description: "siang" });
  });
});

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getCashFlows mengirim filter dan menormalkan stats", async () => {
    const spy = mockResponse({
      status: "success",
      data: { cash_flows: [{ id: 1 }], stats: { cashflow: 10, total_inflow: 10 } },
    });

    const result = await cashFlowApi.getCashFlows({
      type: "inflow",
      source: "cash",
      label: "gaji",
      start_date: "2024-10-05",
      end_date: "2024-10-06 12:00:00",
    });

    expect(result.cashFlows).toEqual([{ id: 1 }]);
    expect(result.stats.total_inflow).toBe(10);
    const url = decodeURIComponent(spy.mock.calls[0][0] as string);
    expect(url).toContain("type=inflow");
    expect(url).toContain("source=cash");
    expect(url).toContain("label=gaji");
    expect(url).toContain("start_date=2024-10-05 00:00:00");
    expect(url).toContain("end_date=2024-10-06 12:00:00");
  });

  it("getCashFlows memakai tanggal akhir hari dan parameter default", async () => {
    const spy = mockResponse({ status: "success", data: { cash_flows: [], stats: {} } });

    await cashFlowApi.getCashFlows({ end_date: "2024-10-05" });
    expect(decodeURIComponent(spy.mock.calls[0][0] as string)).toContain("end_date=2024-10-05 23:59:59");

    await cashFlowApi.getCashFlows();
    expect(spy.mock.calls[1][0]).toMatch(/\/cash-flows\/$/);
  });

  it("getCashFlows melempar error dengan detail validasi", async () => {
    mockResponse({ status: "fail", message: "Data tidak valid", data: { type: ["Tipe salah"] } });
    await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Data tidak valid: Tipe salah");
  });

  it("unwrap memakai pesan bawaan dan mengabaikan data kosong", async () => {
    mockResponse({ status: "fail" });
    await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Gagal mengambil data arus kas");
    mockResponse({ status: "fail", message: "Gagal", data: {} });
    await expect(cashFlowApi.getCashFlows()).rejects.toThrow(/^Gagal$/);
  });

  it("getCashFlowById mengembalikan detail", async () => {
    const spy = mockResponse({ status: "success", data: { cash_flow: { id: 4 } } });
    await expect(cashFlowApi.getCashFlowById(4)).resolves.toEqual({ id: 4 });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("/cash-flows/4"), { method: "GET" });
  });

  it("postCashFlow mengirim payload JSON", async () => {
    const spy = mockResponse({ status: "success", data: { cash_flow_id: 9 } });
    await expect(cashFlowApi.postCashFlow(payload)).resolves.toEqual({ cash_flow_id: 9 });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/cash-flows/"),
      expect.objectContaining({ method: "POST", body: JSON.stringify(payload) })
    );
  });

  it("putCashFlow mengembalikan pesan", async () => {
    const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });
    await expect(cashFlowApi.putCashFlow(3, payload)).resolves.toBe("Berhasil mengubah data");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/cash-flows/3"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deleteCashFlow dan deleteAllCashFlows memakai method DELETE", async () => {
    const spy = mockResponse({ status: "success", message: "Dihapus" });
    await expect(cashFlowApi.deleteCashFlow(3)).resolves.toBe("Dihapus");
    await expect(cashFlowApi.deleteAllCashFlows()).resolves.toBe("Dihapus");
    expect(spy.mock.calls[0]).toEqual([expect.stringContaining("/cash-flows/3"), { method: "DELETE" }]);
    expect(spy.mock.calls[1]).toEqual([expect.stringMatching(/\/cash-flows\/$/), { method: "DELETE" }]);
  });

  it("getLabels mengembalikan daftar label", async () => {
    mockResponse({ status: "success", data: { labels: ["gaji", "makan"] } });
    await expect(cashFlowApi.getLabels()).resolves.toEqual(["gaji", "makan"]);
  });

  it("getStatsDaily dan getStatsMonthly mengirim parameter tren", async () => {
    const trend = { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} };
    const spy = mockResponse({ status: "success", data: trend });

    await expect(cashFlowApi.getStatsDaily({ end_date: "2024-10-05 23:59:59", total_data: 7 })).resolves.toEqual(trend);
    await expect(cashFlowApi.getStatsMonthly({ total_data: 6 })).resolves.toEqual(trend);
    await cashFlowApi.getStatsDaily();
    await cashFlowApi.getStatsMonthly();

    expect(decodeURIComponent(spy.mock.calls[0][0] as string)).toContain("/stats/daily?end_date=2024-10-05 23:59:59&total_data=7");
    expect(spy.mock.calls[1][0]).toContain("/stats/monthly?total_data=6");
    expect(spy.mock.calls[2][0]).toMatch(/\/stats\/daily$/);
    expect(spy.mock.calls[3][0]).toMatch(/\/stats\/monthly$/);
  });

  it.each([
    ["postCashFlow", () => cashFlowApi.postCashFlow(payload), "Gagal menambahkan arus kas"],
    ["putCashFlow", () => cashFlowApi.putCashFlow(1, payload), "Gagal mengubah arus kas"],
    ["deleteCashFlow", () => cashFlowApi.deleteCashFlow(1), "Gagal menghapus arus kas"],
    ["deleteAllCashFlows", () => cashFlowApi.deleteAllCashFlows(), "Gagal mereset seluruh arus kas"],
    ["getCashFlowById", () => cashFlowApi.getCashFlowById(1), "Gagal mengambil detail arus kas"],
    ["getLabels", () => cashFlowApi.getLabels(), "Gagal mengambil daftar label"],
    ["getStatsDaily", () => cashFlowApi.getStatsDaily(), "Gagal mengambil statistik harian"],
    ["getStatsMonthly", () => cashFlowApi.getStatsMonthly(), "Gagal mengambil statistik bulanan"],
  ])("%s melempar pesan bawaan saat gagal", async (_name, call, message) => {
    mockResponse({ status: "fail" });
    await expect(call()).rejects.toThrow(message);
  });
});
