import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  formatShortDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(), close: vi.fn() },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["showErrorDialog", showErrorDialog, "error"],
    ["showSuccessDialog", showSuccessDialog, "success"],
  ])("%s menutup dialog saat dikonfirmasi", async (_name, fn, icon) => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
    const result = await fn("pesan");

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon, text: "pesan" }));
    expect(Swal.close).toHaveBeenCalled();
    expect(result.isConfirmed).toBe(true);
  });

  it.each([
    ["showErrorDialog", showErrorDialog],
    ["showSuccessDialog", showSuccessDialog],
  ])("%s tidak menutup dialog saat tidak dikonfirmasi", async (_name, fn) => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as any);
    await fn("pesan");
    expect(Swal.close).not.toHaveBeenCalled();
  });

  it("showConfirmDialog menampilkan tombol batal", async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
    const result = await showConfirmDialog("Yakin?");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ showCancelButton: true, text: "Yakin?" })
    );
    expect(result.isConfirmed).toBe(true);
  });

  it("formatRupiah memformat angka, string, dan nilai kosong", () => {
    const normalize = (text: string) => text.replace(/\s/g, " ");
    expect(normalize(formatRupiah(2500000))).toBe("Rp 2.500.000");
    expect(normalize(formatRupiah("1000"))).toBe("Rp 1.000");
    expect(normalize(formatRupiah(undefined))).toBe("Rp 0");
    expect(normalize(formatRupiah(null))).toBe("Rp 0");
    expect(formatRupiah(-5000)).toContain("5.000");
  });

  it("formatDate dan formatShortDate menangani nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatShortDate("")).toBe("-");
  });

  it("formatDate dan formatShortDate memformat tanggal valid", () => {
    expect(formatDate("2024-10-05T12:09:16.000000Z")).toContain("2024");
    expect(formatShortDate("2024-10-05T12:09:16.000000Z")).toContain("2024");
  });
});
