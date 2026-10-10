import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import cashFlowApi from "../api/cashFlowApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/cashFlowApi")>();
  return {
    ...actual,
    default: { getCashFlowById: vi.fn(), putCashFlow: vi.fn(), getLabels: vi.fn() },
  };
});
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const cashFlow = {
  id: 4,
  type: "outflow" as const,
  source: "savings" as const,
  label: "alat-elektronik",
  description: "Keyboard dan mouse",
  nominal: 400000,
};

const value = (wrapper: any, testId: string) =>
  (wrapper.get(`[data-testid="${testId}"]`).element as HTMLInputElement).value;

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValue(cashFlow);
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue(["alat-elektronik"]);
  });

  it("tidak merender apa pun dan tidak memuat data saat tertutup", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, cashFlowId: 4 },
      preloadedState: { cashFlow },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="change-cash-flow-modal"]').exists()).toBe(false);
    expect(cashFlowApi.getCashFlowById).not.toHaveBeenCalled();
  });

  it("memuat transaksi dan mengisi formulir saat dibuka", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false, cashFlowId: 4 } });

    await wrapper.setProps({ show: true });
    await flushPromises();

    expect(document.body.style.overflow).toBe("hidden");
    expect(cashFlowApi.getCashFlowById).toHaveBeenCalledWith(4);
    expect(cashFlowApi.getLabels).toHaveBeenCalled();
    expect(value(wrapper, "label-input")).toBe("alat-elektronik");
    expect(value(wrapper, "nominal-input")).toBe("400000");
    expect(value(wrapper, "description-input")).toBe("Keyboard dan mouse");
    expect(value(wrapper, "source-select")).toBe("savings");
    expect(wrapper.get('[data-testid="type-outflow"]').attributes("aria-pressed")).toBe("true");

    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("");
  });

  it("mengisi formulir langsung jika data sudah ada saat modal dipasang terbuka", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowId: 4 },
      preloadedState: { cashFlow },
    });

    expect(value(wrapper, "label-input")).toBe("alat-elektronik");
  });

  it("tidak memuat data jika id belum tersedia", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false } });

    await wrapper.setProps({ show: true });
    await flushPromises();

    expect(cashFlowApi.getCashFlowById).not.toHaveBeenCalled();
  });

  it("memancarkan close dari tombol tutup, batal, dan klik latar", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, cashFlowId: 4 } });

    await wrapper.get('[data-testid="close-change-modal-btn"]').trigger("click");
    await wrapper.get('[data-testid="cancel-change-modal-btn"]').trigger("click");
    await wrapper.get('[data-testid="change-cash-flow-modal"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(3);
  });

  it("menolak formulir yang tidak valid", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, cashFlowId: 4 } });

    await wrapper.get("form").trigger("submit");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Label tidak boleh kosong");
    expect(cashFlowApi.putCashFlow).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan lalu memancarkan saved dan close", async () => {
    let resolveRequest!: (value: string) => void;
    vi.mocked(cashFlowApi.putCashFlow).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false, cashFlowId: 4 } });
    await wrapper.setProps({ show: true });
    await flushPromises();

    await wrapper.get('[data-testid="nominal-input"]').setValue("450000");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get('[data-testid="submit-change-modal-btn"]').text()).toContain("Menyimpan...");
    resolveRequest("ok");
    await flushPromises();

    expect(cashFlowApi.putCashFlow).toHaveBeenCalledWith(4, expect.objectContaining({ nominal: 450000, type: "outflow" }));
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tetap terbuka jika perubahan gagal disimpan", async () => {
    vi.mocked(cashFlowApi.putCashFlow).mockRejectedValueOnce(new Error("Gagal ubah"));
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false, cashFlowId: 4 } });
    await wrapper.setProps({ show: true });
    await flushPromises();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal ubah");
    expect(wrapper.emitted("saved")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(wrapper.get('[data-testid="submit-change-modal-btn"]').text()).toContain("Simpan perubahan");
  });
});
