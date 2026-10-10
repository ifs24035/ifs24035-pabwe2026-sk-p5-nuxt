import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import cashFlowApi from "../api/cashFlowApi";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/cashFlowApi")>();
  return {
    ...actual,
    default: { postCashFlow: vi.fn(), getLabels: vi.fn() },
  };
});
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

async function fillForm(wrapper: ReturnType<typeof renderWithProviders>["wrapper"]) {
  await wrapper.get('[data-testid="type-outflow"]').trigger("click");
  await wrapper.get('[data-testid="source-select"]').setValue("savings");
  await wrapper.get('[data-testid="label-input"]').setValue("alat-elektronik");
  await wrapper.get('[data-testid="nominal-input"]').setValue("400000");
  await wrapper.get('[data-testid="description-input"]').setValue("Keyboard dan mouse");
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
    vi.mocked(cashFlowApi.getLabels).mockResolvedValue(["gaji"]);
  });

  it("tidak merender apa pun saat show bernilai false", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find('[data-testid="add-cash-flow-modal"]').exists()).toBe(false);
  });

  it("mengunci scroll body dan memuat label saat dibuka, lalu melepasnya saat ditutup", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });

    await wrapper.setProps({ show: true });
    await flushPromises();
    expect(document.body.style.overflow).toBe("hidden");
    expect(cashFlowApi.getLabels).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-testid="add-cash-flow-modal"]').exists()).toBe(true);

    await wrapper.setProps({ show: false });
    expect(document.body.style.overflow).toBe("");
    expect(cashFlowApi.getLabels).toHaveBeenCalledTimes(1);
  });

  it("memancarkan close dari tombol tutup, batal, dan klik latar", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.get('[data-testid="close-add-modal-btn"]').trigger("click");
    await wrapper.get('[data-testid="cancel-add-modal-btn"]').trigger("click");
    await wrapper.get('[data-testid="add-cash-flow-modal"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(3);
  });

  it("menolak formulir yang belum lengkap", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await wrapper.get("form").trigger("submit");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Label tidak boleh kosong");
    expect(cashFlowApi.postCashFlow).not.toHaveBeenCalled();
  });

  it("menyimpan transaksi lalu memancarkan saved dan close serta mengosongkan formulir", async () => {
    let resolveRequest!: (value: { cash_flow_id: number }) => void;
    vi.mocked(cashFlowApi.postCashFlow).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await fillForm(wrapper);
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get('[data-testid="submit-add-modal-btn"]').text()).toContain("Menyimpan...");
    resolveRequest({ cash_flow_id: 1 });
    await flushPromises();

    expect(cashFlowApi.postCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "alat-elektronik",
      description: "Keyboard dan mouse",
      nominal: 400000,
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect((wrapper.get('[data-testid="label-input"]').element as HTMLInputElement).value).toBe("");
    expect(wrapper.get('[data-testid="submit-add-modal-btn"]').text()).toContain("Simpan transaksi");
  });

  it("tetap terbuka dan menampilkan error jika penyimpanan gagal", async () => {
    vi.mocked(cashFlowApi.postCashFlow).mockRejectedValueOnce(new Error("Gagal tambah"));
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });

    await fillForm(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal tambah");
    expect(wrapper.emitted("saved")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(wrapper.get('[data-testid="submit-add-modal-btn"]').attributes("disabled")).toBeUndefined();
  });
});
