import Swal, { type SweetAlertResult } from "sweetalert2";

const INK = "#141d32";

export function showErrorDialog(message: string): Promise<SweetAlertResult<any>> {
  return Swal.fire({
    title: "Terjadi kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: INK,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showSuccessDialog(message: string): Promise<SweetAlertResult<any>> {
  return Swal.fire({
    title: "Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: INK,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showConfirmDialog(message: string): Promise<SweetAlertResult<any>> {
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d13338",
    cancelButtonColor: "#7686a3",
  });
}

/** Format angka menjadi mata uang Rupiah, contoh: 2500000 -> "Rp 2.500.000" */
export function formatRupiah(value: number | string | null | undefined): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/** Format tanggal & waktu lengkap, contoh: "05 Oktober 2024 12.09" */
export function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format tanggal singkat tanpa jam, contoh: "5 Okt 2024" */
export function formatShortDate(date: string | number | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
