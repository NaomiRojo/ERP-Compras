import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";

import type { AccountsPayable, AuditRow, InventoryRow, Metric, Order, Payment } from "../types";
import { DashboardScreen } from "./Dashboard";

const metrics: Metric[] = [
  {
    hint: "Ordenes pendientes de cierre",
    label: "Ordenes abiertas",
    value: "1",
  },
];

const ordenes: Order[] = [
  {
    id: "order-1",
    approvedBy: "supervisor",
    comentarios: "Compra de reposicion",
    createdBy: "admin",
    descuentoTotal: 0,
    docNum: "1001",
    estado: "APROBADO",
    estadoId: 2,
    fecha: "2026-04-29",
    fechaDocumento: "2026-04-29",
    fechaVencimiento: "2026-05-10",
    lines: [],
    moneda: "Bs",
    monedaId: 1,
    proveedor: "Proveedor Uno",
    proveedorId: "prov-1",
    subtotal: 1000,
    impuestosTotal: 130,
    timeline: [],
    total: 1130,
  },
];

const cuentas: AccountsPayable[] = [
  {
    id: "cxp-1",
    compraId: "order-1",
    estado: "PENDIENTE",
    factura: "FAC-100",
    proveedor: "Proveedor Uno",
    proveedorId: "prov-1",
    saldo: 500,
    total: 1130,
    vencimiento: "2026-05-15",
  },
];

const inventario: InventoryRow[] = [
  {
    id: "stock-1",
    almacen: "Central",
    almacenId: "alm-1",
    articuloId: "art-1",
    comprometido: 0,
    disponible: 0,
    fisico: 0,
    nombre: "Articulo Uno",
    solicitado: 10,
    sku: "SKU-001",
  },
];

const pagos: Payment[] = [
  {
    id: "pay-1",
    cuentaPorPagarId: "cxp-1",
    fecha: "2026-04-29",
    monto: 300,
    proveedor: "Proveedor Uno",
    proveedorId: "prov-1",
    referencia: "TRX-001",
    usuario: "tesoreria",
  },
];

const auditoria: AuditRow[] = [
  {
    id: "audit-1",
    accion: "UPDATE",
    dataAntes: { estado: "BORRADOR" },
    dataDespues: { estado: "APROBADO" },
    entidad: "OrdenCompra",
    entidadId: "order-1",
    fecha: "2026-04-29 10:20",
    ipOrigen: "127.0.0.1",
    usuario: "admin",
  },
  {
    id: "audit-2",
    accion: "CREATE",
    dataAntes: null,
    dataDespues: { cardCode: "PR-001" },
    entidad: "Proveedor",
    entidadId: "prov-1",
    fecha: "2026-04-28 09:00",
    usuario: "compras",
  },
];

const renderDashboard = (override?: Partial<Parameters<typeof DashboardScreen>[0]>) =>
  render(
    <DashboardScreen
      auditoria={auditoria}
      cuentas={cuentas}
      inventario={inventario}
      metrics={metrics}
      ordenes={ordenes}
      pagos={pagos}
      {...override}
    />,
  );

describe("DashboardScreen", () => {
  it("muestra resumen ejecutivo, alertas y actividad reciente de auditoria", () => {
    const view = renderDashboard();

    expect(view.getByText("Resumen financiero y operativo")).toBeTruthy();
    expect(view.getByText("1 ordenes")).toBeTruthy();
    expect(view.getByText("1 CxP pendientes")).toBeTruthy();
    expect(view.getByText("1 alertas stock")).toBeTruthy();
    expect(view.getByText("Hay 1 articulo(s) sin stock disponible. Revisa inventario antes de nuevas compras.")).toBeTruthy();

    expect(view.getByText("Actividad reciente")).toBeTruthy();
    expect(view.getByText("OrdenCompra")).toBeTruthy();
    expect(view.getByText("order-1")).toBeTruthy();
    expect(view.getAllByText("Proveedor").length).toBeGreaterThan(0);
    expect(view.getByText("prov-1")).toBeTruthy();
    expect(view.getByRole("link", { name: "Ver bitacora" }).getAttribute("href")).toBe("#/app/auditoria");
  });

  it("omite actividad reciente cuando no hay eventos de auditoria", () => {
    const view = renderDashboard({ auditoria: [] });

    expect(view.queryByText("Actividad reciente")).toBeNull();
    expect(view.getByText("Ordenes criticas")).toBeTruthy();
  });
});
