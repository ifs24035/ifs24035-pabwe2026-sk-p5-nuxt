import { describe, it, expect } from "vitest";
import { reactive } from "vue";
import { mount } from "@vue/test-utils";
import CashFlowForm from "./CashFlowForm.vue";
import { emptyForm } from "../api/cashFlowApi";

describe("CashFlowForm", () => {
  it("mengubah jenis arus kas lewat tombol", async () => {
    const form = reactive(emptyForm());
    const wrapper = mount(CashFlowForm, { props: { form } });

    expect(wrapper.get('[data-testid="type-inflow"]').attributes("aria-pressed")).toBe("true");
    expect(wrapper.get('[data-testid="type-outflow"]').attributes("aria-pressed")).toBe("false");

    await wrapper.get('[data-testid="type-outflow"]').trigger("click");
    expect(form.type).toBe("outflow");
    expect(wrapper.get('[data-testid="type-outflow"]').attributes("aria-pressed")).toBe("true");

    await wrapper.get('[data-testid="type-inflow"]').trigger("click");
    expect(form.type).toBe("inflow");
  });

  it("mengikat sumber dana, label, nominal, dan keterangan ke form", async () => {
    const form = reactive(emptyForm());
    const wrapper = mount(CashFlowForm, { props: { form } });

    await wrapper.get('[data-testid="source-select"]').setValue("savings");
    await wrapper.get('[data-testid="label-input"]').setValue("gaji");
    await wrapper.get('[data-testid="nominal-input"]').setValue("2500000");
    await wrapper.get('[data-testid="description-input"]').setValue("Gaji bulanan");

    expect(form).toMatchObject({
      source: "savings",
      label: "gaji",
      nominal: 2500000,
      description: "Gaji bulanan",
    });
    expect(wrapper.get('[data-testid="nominal-preview"]').text().replace(/\s/g, " ")).toBe("Rp 2.500.000");
  });

  it("menampilkan saran label dan memakai daftar kosong secara bawaan", () => {
    const withLabels = mount(CashFlowForm, { props: { form: reactive(emptyForm()), labels: ["gaji", "makan"] } });
    const withoutLabels = mount(CashFlowForm, { props: { form: reactive(emptyForm()) } });

    expect(withLabels.findAll("datalist option")).toHaveLength(2);
    expect(withoutLabels.findAll("datalist option")).toHaveLength(0);
  });
});
