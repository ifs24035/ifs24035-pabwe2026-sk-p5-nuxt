import apiHelper from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id?: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at?: string;
  updated_at?: string;
}

/** Ringkasan saldo hasil olahan dari `stats` pada response API. */
export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

export type StatsSeries = Record<string, number>;

export interface CashFlowTrend {
  stats_inflow: StatsSeries;
  stats_outflow: StatsSeries;
  stats_cashflow: StatsSeries;
}

export interface CashFlowTrendParams {
  end_date?: string;
  total_data?: number;
}

export interface CashFlowList {
  cashFlows: CashFlow[];
  stats: CashFlowStats;
}

const num = (value: unknown): number => Number(value) || 0;

export function emptyStats(): CashFlowStats {
  return { cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 };
}

/** Mengubah `stats` mentah dari API menjadi saldo bersih per sumber dana. */
export function normalizeStats(raw: Record<string, unknown> | null | undefined): CashFlowStats {
  const s = raw ?? {};
  return {
    cashflow: num(s.cashflow),
    total_inflow: num(s.total_inflow),
    total_outflow: num(s.total_outflow),
    cash: num(s.total_inflow_cash) - num(s.total_outflow_cash),
    savings: num(s.total_inflow_savings) - num(s.total_outflow_savings),
    loans: num(s.total_inflow_loans) - num(s.total_outflow_loans),
  };
}

/** Tanggal `YYYY-MM-DD` dari input date -> timestamp `YYYY-MM-DD HH:mm:ss`. */
function toTimestamp(date: string, endOfDay: boolean): string {
  if (date.includes(":")) return date;
  return `${date} ${endOfDay ? "23:59:59" : "00:00:00"}`;
}

export function buildQuery(params: Record<string, string | number | undefined | null> = {}): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const text = query.toString().replace(/\+/g, "%20");
  return text ? `?${text}` : "";
}

const cashFlowApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/cash-flows`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  async function unwrap(response: Response, fallback: string) {
    const result = await response.json();
    if (result.status !== "success") {
      const details =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const message = result.message || fallback;
      throw new Error(details ? `${message}: ${details}` : message);
    }
    return result;
  }

  async function getCashFlows(params: CashFlowQueryParams = {}): Promise<CashFlowList> {
    const query = buildQuery({
      type: params.type,
      source: params.source,
      label: params.label,
      start_date: params.start_date ? toTimestamp(params.start_date, false) : "",
      end_date: params.end_date ? toTimestamp(params.end_date, true) : "",
    });
    const response = await apiHelper.fetchData(_url("/") + query, { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil data arus kas");
    return {
      cashFlows: result.data.cash_flows,
      stats: normalizeStats(result.data.stats),
    };
  }

  async function getCashFlowById(id: number | string): Promise<CashFlow> {
    const response = await apiHelper.fetchData(_url(`/${id}`), { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil detail arus kas");
    return result.data.cash_flow;
  }

  async function postCashFlow(payload: CashFlowPayload): Promise<{ cash_flow_id: number }> {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await unwrap(response, "Gagal menambahkan arus kas");
    return result.data;
  }

  async function putCashFlow(id: number | string, payload: CashFlowPayload): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await unwrap(response, "Gagal mengubah arus kas");
    return result.message;
  }

  async function deleteCashFlow(id: number | string): Promise<string> {
    const response = await apiHelper.fetchData(_url(`/${id}`), { method: "DELETE" });
    const result = await unwrap(response, "Gagal menghapus arus kas");
    return result.message;
  }

  async function deleteAllCashFlows(): Promise<string> {
    const response = await apiHelper.fetchData(_url("/"), { method: "DELETE" });
    const result = await unwrap(response, "Gagal mereset seluruh arus kas");
    return result.message;
  }

  async function getLabels(): Promise<string[]> {
    const response = await apiHelper.fetchData(_url("/labels"), { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil daftar label");
    return result.data.labels;
  }

  async function getStatsDaily(params: CashFlowTrendParams = {}): Promise<CashFlowTrend> {
    const query = buildQuery({ end_date: params.end_date, total_data: params.total_data });
    const response = await apiHelper.fetchData(_url("/stats/daily") + query, { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil statistik harian");
    return result.data;
  }

  async function getStatsMonthly(params: CashFlowTrendParams = {}): Promise<CashFlowTrend> {
    const query = buildQuery({ end_date: params.end_date, total_data: params.total_data });
    const response = await apiHelper.fetchData(_url("/stats/monthly") + query, { method: "GET" });
    const result = await unwrap(response, "Gagal mengambil statistik bulanan");
    return result.data;
  }

  return {
    getCashFlows,
    getCashFlowById,
    postCashFlow,
    putCashFlow,
    deleteCashFlow,
    deleteAllCashFlows,
    getLabels,
    getStatsDaily,
    getStatsMonthly,
  };
})();

export default cashFlowApi;

/** Nilai mentah pada formulir tambah/ubah transaksi. */
export interface CashFlowFormValues {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  /** `<input type="number">` menghasilkan number, field kosong menghasilkan string kosong. */
  nominal: string | number;
  description: string;
}

export function emptyForm(): CashFlowFormValues {
  return { type: "inflow", source: "cash", label: "", nominal: "", description: "" };
}

/** Mengembalikan pesan kesalahan pertama, atau `null` jika formulir valid. */
export function validateForm(form: CashFlowFormValues): string | null {
  if (!form.label.trim()) return "Label tidak boleh kosong";
  if (!(Number(form.nominal) > 0)) return "Nominal harus lebih besar dari 0";
  if (!form.description.trim()) return "Keterangan tidak boleh kosong";
  return null;
}

export function toPayload(form: CashFlowFormValues): CashFlowPayload {
  return {
    type: form.type,
    source: form.source,
    label: form.label.trim(),
    description: form.description.trim(),
    nominal: Number(form.nominal),
  };
}

export const SOURCE_LABELS: Record<CashFlowSource, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const TYPE_LABELS: Record<CashFlowType, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};
