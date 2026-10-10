import { describe, it, expect, vi, beforeEach } from "vitest";

const registered: string[] = [];

// createWebHistory palsu: mencatat listener window yang dipasangnya (seperti vue-router asli).
vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  createWebHistory: vi.fn(() => {
    window.addEventListener("popstate", () => {});
    window.addEventListener("pagehide", () => {});
    return { destroy: vi.fn() };
  }),
}));

import { createWebHistory } from "vue-router";
import { createBfcacheFriendlyHistory } from "./router";

describe("createBfcacheFriendlyHistory", () => {
  beforeEach(() => {
    registered.length = 0;
    vi.clearAllMocks();
  });

  it("memblokir listener pagehide tetapi tetap memasang popstate", () => {
    const original = window.addEventListener;
    const recorder = ((type: string) => {
      registered.push(type);
    }) as typeof window.addEventListener;
    window.addEventListener = recorder;

    try {
      const history = createBfcacheFriendlyHistory("/base");

      expect(createWebHistory).toHaveBeenCalledWith("/base");
      expect(registered).toEqual(["popstate"]);
      expect(history).toBeDefined();
      // addEventListener dipulihkan setelah riwayat dibuat
      expect(window.addEventListener).toBe(recorder);
    } finally {
      window.addEventListener = original;
    }
  });

  it("memulihkan addEventListener walaupun pembuatan riwayat gagal", () => {
    vi.mocked(createWebHistory).mockImplementationOnce(() => {
      throw new Error("gagal");
    });
    const before = window.addEventListener;

    expect(() => createBfcacheFriendlyHistory()).toThrow("gagal");
    expect(window.addEventListener).toBe(before);
  });
});
