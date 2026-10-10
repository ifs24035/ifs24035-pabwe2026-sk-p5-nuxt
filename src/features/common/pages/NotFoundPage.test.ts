import { describe, it, expect } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan tautan kembali", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    expect(wrapper.get('[data-testid="back-home-link"]').attributes("href")).toBe("/");
  });
});
