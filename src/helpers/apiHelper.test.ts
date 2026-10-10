import { describe, it, expect, beforeEach, vi } from "vitest";
import apiHelper from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("menyimpan, membaca, dan menghapus access token", () => {
    expect(apiHelper.getAccessToken()).toBeNull();
    apiHelper.putAccessToken("dummy-token");
    expect(apiHelper.getAccessToken()).toBe("dummy-token");
    apiHelper.putAccessToken("");
    expect(apiHelper.getAccessToken()).toBeNull();
    apiHelper.putAccessToken("abc");
    apiHelper.putAccessToken(null);
    expect(apiHelper.getAccessToken()).toBeNull();
  });

  it("menambahkan header Authorization dan merapikan trailing slash", async () => {
    apiHelper.putAccessToken("test-token");
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch as any;

    await apiHelper.fetchData("http://x.test/api/cash-flows/", { method: "GET" });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://x.test/api/cash-flows",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer test-token" },
      })
    );
  });

  it("mempertahankan query string dan header bawaan tanpa token", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch as any;

    await apiHelper.fetchData("http://x.test/api/cash-flows/?type=inflow", {
      headers: { "Content-Type": "application/json" },
    });
    await apiHelper.fetchData("http://x.test/api/cash-flows");

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://x.test/api/cash-flows?type=inflow",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://x.test/api/cash-flows",
      expect.objectContaining({ headers: {} })
    );
  });
});
