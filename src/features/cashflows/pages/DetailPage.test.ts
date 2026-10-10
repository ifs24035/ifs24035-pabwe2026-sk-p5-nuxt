import { describe, it, expect, vi, beforeEach } from "vitest";
import { h } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import DetailPage from "./DetailPage.vue";
import cashFlowApi from "../api/cashFlowApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/cashFlowApi")>();
  return {
    ...actual,
    default: {
      getCashFlowById: vi.fn(),
      putCashFlow: vi.fn(),
      deleteCashFlow: vi.fn(),
      getLabels: vi.fn(),
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
  id: 7,
  type: "inflow" as const,
  source: "cash" as const,
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
  created_at: "2024-10-05T11:26:45.000000Z",
  updated_at: "2024-10-05T11:26:48.000000Z",
};
const outflow = { ...inflow, id: 8, type: "outflow" as const, source: "loans" as const, label: "cicilan" };

const money = (text: string) => text.replace(/\s/g, " ");

async function mountPage(id = "7") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { render: () => h("div", "Beranda") } },
      { path: "/cash-flows/:cashFlowId", component: DetailPage },
    ],
  });
  await router.push(`/cash-flows/${id}`);
  await router.isReady();
  const result = renderWithProviders(DetailPage, { router });
  await flushPromises();
  return result;
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValue(inflow);
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue([]);
  });

  it("menampilkan status memuat sebelum data tiba", async () => {
    let resolveRequest!: (value: any) => void;
    vi.mocked(cashFlowApi.getCashFlowById).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/cash-flows/:cashFlowId", component: DetailPage }],
    });
    await router.push("/cash-flows/7");
    const { wrapper } = renderWithProviders(DetailPage, { router });
    await flushPromises();
    expect(wrapper.find('[data-testid="detail-loading"]').exists()).toBe(true);

    resolveRequest(inflow);
    await flushPromises();
    expect(wrapper.find('[data-testid="detail-loading"]').exists()).toBe(false);
  });

  it("menampilkan rincian transaksi pemasukan", async () => {
    const { wrapper } = await mountPage();

    expect(cashFlowApi.getCashFlowById).toHaveBeenCalledWith("7");
    expect(wrapper.get('[data-testid="detail-type"]').text()).toBe("Pemasukan");
    expect(money(wrapper.get('[data-testid="detail-nominal"]').text())).toBe("+ Rp 2.500.000");
    expect(wrapper.get('[data-testid="detail-nominal"]').classes()).toContain("text-inflow-700");
    expect(wrapper.get('[data-testid="detail-header"]').classes()).toContain("bg-inflow-50");
    expect(wrapper.get('[data-testid="detail-label"]').text()).toBe("gaji");
    expect(wrapper.get('[data-testid="detail-source"]').text()).toBe("Tunai");
    expect(wrapper.get('[data-testid="detail-description"]').text()).toBe("Gaji bulanan");
    expect(wrapper.get('[data-testid="detail-created"]').text()).toContain("2024");
    expect(wrapper.get('[data-testid="detail-updated"]').text()).toContain("2024");
    expect(wrapper.get('[data-testid="back-link"]').attributes("href")).toBe("/");
  });

  it("menampilkan rincian transaksi pengeluaran", async () => {
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValue(outflow);
    const { wrapper } = await mountPage("8");

    expect(wrapper.get('[data-testid="detail-type"]').text()).toBe("Pengeluaran");
    expect(money(wrapper.get('[data-testid="detail-nominal"]').text())).toBe("- Rp 2.500.000");
    expect(wrapper.get('[data-testid="detail-header"]').classes()).toContain("bg-outflow-50");
    expect(wrapper.get('[data-testid="detail-source"]').text()).toBe("Pinjaman");
  });

  it("menampilkan pesan jika transaksi tidak ditemukan", async () => {
    vi.mocked(cashFlowApi.getCashFlowById).mockRejectedValue(new Error("Tidak ada"));
    const { wrapper } = await mountPage("99");

    expect(wrapper.get('[data-testid="detail-not-found"]').text()).toContain("Transaksi tidak ditemukan");
    expect(wrapper.find('[data-testid="detail-type"]').exists()).toBe(false);
  });

  it("mengubah transaksi lewat modal lalu memuat ulang rincian", async () => {
    vi.mocked(cashFlowApi.putCashFlow).mockResolvedValue("ok");
    const { wrapper } = await mountPage();
    expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="edit-detail-btn"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(true);

    const callsBefore = vi.mocked(cashFlowApi.getCashFlowById).mock.calls.length;
    await wrapper.get("[data-testid='change-cash-flow-modal'] form").trigger("submit");
    await flushPromises();

    expect(cashFlowApi.putCashFlow).toHaveBeenCalledWith("7", expect.objectContaining({ label: "gaji" }));
    expect(vi.mocked(cashFlowApi.getCashFlowById).mock.calls.length).toBeGreaterThan(callsBefore);
    expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="edit-detail-btn"]').trigger("click");
    await wrapper.get('[data-testid="close-change-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);
  });

  it("menghapus transaksi setelah dikonfirmasi lalu kembali ke beranda", async () => {
    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce({ isConfirmed: true } as any);
    vi.mocked(cashFlowApi.deleteCashFlow).mockResolvedValue("ok");
    const { wrapper, router } = await mountPage();

    await wrapper.get('[data-testid="delete-detail-btn"]').trigger("click");
    await flushPromises();

    expect(cashFlowApi.deleteCashFlow).toHaveBeenCalledWith("7");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("tidak menghapus jika dialog dibatalkan", async () => {
    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce({ isConfirmed: false } as any);
    const { wrapper, router } = await mountPage();

    await wrapper.get('[data-testid="delete-detail-btn"]').trigger("click");
    await flushPromises();

    expect(cashFlowApi.deleteCashFlow).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/cash-flows/7");
  });
});
