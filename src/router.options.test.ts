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

  it("membuat router dengan history bawaan", () => {
    expect(createAppRouter().options.routes).toBe(routes);
  });
});
