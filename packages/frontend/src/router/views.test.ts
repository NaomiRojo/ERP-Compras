import { describe, expect, it } from "bun:test";

import {
  AUTH_LOGIN_PATH,
  AUTH_TWO_FACTOR_PATH,
  NAV_ITEMS,
  ROLE_VIEW_ACCESS,
  VIEW_LABELS,
  buildViewPath,
  getFallbackView,
  getFallbackViewPath,
  getNavItemsForViews,
  isViewKey,
  resolveRedirectTarget,
} from "./views";

describe("router views", () => {
  it("expone las rutas y labels esperados", () => {
    expect(AUTH_LOGIN_PATH).toBe("/auth/login");
    expect(AUTH_TWO_FACTOR_PATH).toBe("/auth/two-factor");
    expect(VIEW_LABELS.dashboard).toBe("Dashboard general");
    expect(NAV_ITEMS).toHaveLength(9);
    expect(ROLE_VIEW_ACCESS.ADMIN).toContain("usuarios");
  });

  it("reconoce keys validas y construye paths", () => {
    expect(isViewKey("ordenes")).toBe(true);
    expect(isViewKey("desconocida")).toBe(false);
    expect(buildViewPath("proveedores")).toBe("/app/proveedores");
  });

  it("filtra navegacion y resuelve fallback", () => {
    expect(getNavItemsForViews(["dashboard", "pagos"]).map((item) => item.key)).toEqual([
      "dashboard",
      "pagos",
    ]);
    expect(getFallbackView(["inventario", "dashboard"])).toBe("inventario");
    expect(getFallbackView([])).toBe("dashboard");
    expect(getFallbackViewPath(["pagos"])).toBe("/app/pagos");
    expect(getFallbackViewPath([])).toBe("/app/dashboard");
  });

  it("solo acepta redirects internos del app", () => {
    expect(resolveRedirectTarget(undefined, "/app/dashboard")).toBe("/app/dashboard");
    expect(resolveRedirectTarget({ from: 123 }, "/app/dashboard")).toBe("/app/dashboard");
    expect(resolveRedirectTarget({ from: "/auth/login" }, "/app/dashboard")).toBe("/app/dashboard");
    expect(resolveRedirectTarget({ from: "/app" }, "/app/dashboard")).toBe("/app");
    expect(resolveRedirectTarget({ from: "/app/ordenes" }, "/app/dashboard")).toBe("/app/ordenes");
  });
});
