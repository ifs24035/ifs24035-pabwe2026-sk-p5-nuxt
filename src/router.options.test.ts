import { describe, it, expect } from "vitest";
import routerOptions from "./router.options";
import { routes } from "./routes";
import { createAppRouter, routes as exportedRoutes } from "./router";
import { createMemoryHistory } from "vue-router";

describe("router.options", () => {
  it("mengembalikan rute dari routes.ts", () => {
    const resolved = (routerOptions.routes as () => typeof routes)();
    expect(resolved).toBe(routes);
    expect(exportedRoutes).toBe(routes);
  });

  it("mendefinisikan seluruh rute aplikasi", () => {
    const router = createAppRouter(createMemoryHistory());

    expect(router.resolve("/auth/login").name).toBe("login");
    expect(router.resolve("/auth/register").name).toBe("register");
    expect(router.resolve("/").name).toBe("home");
    expect(router.resolve("/cash-flows/12").name).toBe("cash-flow-detail");
    expect(router.resolve("/cash-flows/12").params.cashFlowId).toBe("12");
    expect(router.resolve("/users").name).toBe("users");
    expect(router.resolve("/profile").name).toBe("profile");
    expect(router.resolve("/tidak/ada").name).toBe("not-found");
  });

  it("memuat komponen halaman dashboard secara lazy", async () => {
    const records = routes.flatMap((route) => [route, ...(route.children ?? [])]);
    const loaders = records
      .map((route) => route.component)
      .filter((component): component is () => Promise<{ default: unknown }> => typeof component === "function");

    expect(loaders).toHaveLength(5);
    const modules = await Promise.all(loaders.map((load) => load()));
    modules.forEach((module) => expect(module.default).toBeDefined());
  });

  it("membuat router dengan history bawaan", () => {
    expect(createAppRouter().options.routes).toBe(routes);
  });
});
