import type { NavItem, UserRole, ViewKey } from "../types";

const APP_ROUTE_PREFIX = "/app";

export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_TWO_FACTOR_PATH = "/auth/two-factor";

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Resumen operativo" },
  { key: "usuarios", label: "Usuarios", description: "Accesos y perfiles" },
  { key: "proveedores", label: "Proveedores", description: "Maestro comercial" },
  { key: "articulos", label: "Articulos", description: "Catalogo de compra" },
  { key: "ordenes", label: "Ordenes", description: "Gestion documental" },
  { key: "inventario", label: "Inventario", description: "Stock y movimientos" },
  { key: "cxp", label: "Cuentas por pagar", description: "Saldos pendientes" },
  { key: "pagos", label: "Pagos", description: "Historico financiero" },
  { key: "reportes", label: "Reportes", description: "Indicadores y alertas" },
  { key: "auditoria", label: "Auditoria", description: "Trazabilidad" },
];

export const VIEW_LABELS: Record<ViewKey, string> = {
  dashboard: "Dashboard general",
  usuarios: "Usuarios del sistema",
  proveedores: "Maestro de proveedores",
  articulos: "Catalogo de articulos",
  ordenes: "Ordenes de compra",
  inventario: "Inventario y stock",
  cxp: "Cuentas por pagar",
  pagos: "Pagos",
  reportes: "Reportes operativos",
  auditoria: "Bitacora de auditoria",
};

export const ROLE_VIEW_ACCESS: Record<UserRole, ViewKey[]> = {
  ADMIN: [
    "dashboard",
    "usuarios",
    "proveedores",
    "articulos",
    "ordenes",
    "inventario",
    "cxp",
    "pagos",
    "reportes",
    "auditoria",
  ],
  COMPRAS: ["dashboard", "proveedores", "articulos", "ordenes", "inventario", "cxp", "pagos", "reportes"],
  ALMACEN: ["dashboard", "articulos", "ordenes", "inventario"],
  SUPERVISOR: ["dashboard", "proveedores", "articulos", "ordenes", "inventario", "cxp", "pagos", "reportes", "auditoria"],
};

const viewKeySet = new Set<ViewKey>(NAV_ITEMS.map((item) => item.key));

export const isViewKey = (value: string): value is ViewKey =>
  viewKeySet.has(value as ViewKey);

export const buildViewPath = (view: ViewKey): string => `${APP_ROUTE_PREFIX}/${view}`;

export const getNavItemsForViews = (views: readonly ViewKey[]): NavItem[] => {
  const allowedViews = new Set(views);
  return NAV_ITEMS.filter((item) => allowedViews.has(item.key));
};

export const getFallbackView = (views: readonly ViewKey[]): ViewKey =>
  views[0] ?? "dashboard";

export const getFallbackViewPath = (views: readonly ViewKey[]): string =>
  buildViewPath(getFallbackView(views));

export const resolveRedirectTarget = (state: unknown, fallback: string): string => {
  if (typeof state !== "object" || state === null) {
    return fallback;
  }

  const from = (state as { from?: unknown }).from;
  if (typeof from !== "string") {
    return fallback;
  }

  if (from === APP_ROUTE_PREFIX || from.startsWith(`${APP_ROUTE_PREFIX}/`)) {
    return from;
  }

  return fallback;
};
