import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import { erpService } from "../api/erp";
import { NotificationsProvider } from "../components/Common/Notifications";
import type { AppData } from "../types";
import { ReportesScreen } from "./Reportes";

const data: AppData = {
  articulos: [],
  auditoria: [],
  cxp: [
    {
      id: "cxp-1",
      compraId: "order-1",
      estado: "VENCIDA",
      factura: "FAC-100",
      proveedor: "Proveedor Uno",
      proveedorId: "prov-1",
      saldo: 500,
      total: 1130,
      vencimiento: "2020-01-01",
    },
    {
      id: "cxp-2",
      compraId: "order-2",
      estado: "PAGADA",
      factura: "FAC-200",
      proveedor: "Proveedor Dos",
      proveedorId: "prov-2",
      saldo: 0,
      total: 200,
      vencimiento: "2030-01-01",
    },
  ],
  inventario: [
    {
      id: "stock-1",
      almacen: "Central",
      almacenId: "alm-1",
      articuloId: "art-1",
      comprometido: 2,
      disponible: 0,
      fisico: 0,
      nombre: "Articulo Critico",
      solicitado: 5,
      sku: "SKU-001",
    },
    {
      id: "stock-2",
      almacen: "Secundario",
      almacenId: "alm-2",
      articuloId: "art-2",
      comprometido: 0,
      disponible: 20,
      fisico: 20,
      nombre: "Articulo Normal",
      solicitado: 0,
      sku: "SKU-002",
    },
  ],
  movimientos: [],
  ordenes: [
    {
      id: "order-1",
      approvedBy: "supervisor",
      comentarios: "Compra pendiente",
      createdBy: "admin",
      descuentoTotal: 0,
      docNum: "1001",
      estado: "APROBADO",
      estadoId: 2,
      fecha: "2026-04-29",
      fechaDocumento: "2026-04-29",
      fechaVencimiento: "2026-05-10",
      impuestosTotal: 130,
      lines: [
        {
          id: "line-1",
          almacenId: "alm-1",
          articuloId: "art-1",
          description: "Articulo Critico",
          discount: 0,
          impuestoId: 1,
          lineNum: 1,
          lineSubtotal: 1000,
          lineTotal: 1130,
          pendingQty: 5,
          price: 100,
          qty: 10,
          sku: "SKU-001",
        },
      ],
      moneda: "Bs",
      monedaId: 1,
      proveedor: "Proveedor Uno",
      proveedorId: "prov-1",
      subtotal: 1000,
      timeline: [],
      total: 1130,
    },
    {
      id: "order-2",
      comentarios: "Compra cerrada",
      createdBy: "admin",
      descuentoTotal: 0,
      docNum: "1002",
      estado: "CERRADO",
      estadoId: 4,
      fecha: "2026-04-20",
      fechaDocumento: "2026-04-20",
      impuestosTotal: 0,
      lines: [],
      moneda: "Bs",
      monedaId: 1,
      proveedor: "Proveedor Dos",
      proveedorId: "prov-2",
      subtotal: 200,
      timeline: [],
      total: 200,
    },
  ],
  pagos: [
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
  ],
  proveedores: [
    {
      id: "prov-1",
      activo: true,
      balance: 1500,
      cardCode: "PR-001",
      cardName: "Proveedor Uno",
      direccion: "Av. Principal",
      email: "uno@proveedor.test",
      lineaCredito: 1000,
      moneda: "Bs",
      monedaId: 1,
      nitRut: "1234567",
      nombreComercial: "Proveedor Uno SRL",
      telefono: "77777777",
    },
    {
      id: "prov-2",
      activo: true,
      balance: 100,
      cardCode: "PR-002",
      cardName: "Proveedor Dos",
      direccion: "Calle Dos",
      email: "dos@proveedor.test",
      lineaCredito: 1000,
      moneda: "Bs",
      monedaId: 1,
      nitRut: "7654321",
      nombreComercial: "Proveedor Dos SRL",
      telefono: "76666666",
    },
  ],
  users: [],
};

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{`${location.pathname}${location.search}`}</span>;
}

const renderReportes = () =>
  render(
    <NotificationsProvider>
      <MemoryRouter initialEntries={["/app/reportes"]}>
        <ReportesScreen data={data} />
        <LocationProbe />
      </MemoryRouter>
    </NotificationsProvider>,
  );

const powerBiDatasetMock = {
  generatedAt: "2026-05-01T10:00:00.000Z",
  period: { from: "2026-05-01", to: "2026-05-31" },
  summary: {
    totalPurchases: 1200,
    pendingOrders: 2,
    activeProviders: 2,
    productsPurchased: 10,
    accountsPayableBalance: 500,
    paidAmount: 300,
    overdueAccounts: 1,
  },
  monthlyPurchases: [],
  topProviders: [],
  topProducts: [],
  spendByCategory: [],
  ordersByStatus: [],
  orders: [],
};

const powerBiSqlMock = {
  generatedAt: "2026-05-01T10:00:00.000Z",
  databaseEngine: "PostgreSQL",
  notes: [],
  queries: {
    monthlyPurchases: "SELECT 1",
    topProviders: "SELECT 1",
    topProducts: "SELECT 1",
    spendByCategory: "SELECT 1",
  },
};

const originalFetchPowerBiDataset = erpService.fetchPowerBiComprasDataset;
const originalFetchPowerBiSql = erpService.fetchPowerBiSqlTemplates;

beforeEach(() => {
  erpService.fetchPowerBiComprasDataset = mock(
    async () => powerBiDatasetMock,
  ) as typeof erpService.fetchPowerBiComprasDataset;
  erpService.fetchPowerBiSqlTemplates = mock(
    async () => powerBiSqlMock,
  ) as typeof erpService.fetchPowerBiSqlTemplates;
});

afterEach(() => {
  erpService.fetchPowerBiComprasDataset = originalFetchPowerBiDataset;
  erpService.fetchPowerBiSqlTemplates = originalFetchPowerBiSql;
});

describe("ReportesScreen", () => {
  it("filtra por proveedor y permite limpiar filtros", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const view = renderReportes();

    expect(view.getByText("2 ordenes")).toBeTruthy();
    expect(view.getByText("2 CxP")).toBeTruthy();
    expect(view.getByText("0 filtros activos")).toBeTruthy();

    await user.selectOptions(view.getByLabelText("Proveedor"), "prov-1");

    expect(view.getByText("1 ordenes")).toBeTruthy();
    expect(view.getByText("1 CxP")).toBeTruthy();
    expect(view.getByText("1 filtros activos")).toBeTruthy();
    expect(view.queryByText("OC-1002")).toBeNull();

    await user.click(view.getByRole("button", { name: "Limpiar" }));

    expect(view.getByText("2 ordenes")).toBeTruthy();
    expect(view.getByText("0 filtros activos")).toBeTruthy();
  });

  it("navega desde una alerta inteligente y exporta CSV con el corte visible", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const exportedBlob: { current?: Blob } = {};
    const createObjectURL = mock((blob: Blob) => {
      exportedBlob.current = blob;
      return "blob:reportes";
    });
    const revokeObjectURL = mock(() => undefined);

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const originalCreateElement = document.createElement.bind(document);
    const linkClick = mock(() => undefined);
    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        element.click = linkClick;
      }
      return element;
    }) as typeof document.createElement;

    try {
      const view = renderReportes();

      expect(view.getByText("Proveedor sobre linea de credito")).toBeTruthy();

      await user.click(view.getByRole("button", { name: "Revisar ordenes" }));

      expect(view.getByTestId("location").textContent).toBe("/app/ordenes?q=Proveedor%20Uno");

      await user.click(view.getByRole("button", { name: "CSV" }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(linkClick).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:reportes");
      expect(exportedBlob.current).toBeTruthy();

      if (!exportedBlob.current) {
        throw new Error("No se genero el reporte CSV");
      }

      const csv = await exportedBlob.current.text();
      expect(csv).toContain('"ERP Compras","Reporte operativo"');
      expect(csv).toContain('"Proveedor sobre linea de credito"');
      expect(csv).toContain('"OC-1001"');
    } finally {
      document.createElement = originalCreateElement;
    }
  });

  it("descarga un archivo PBIDS para abrir el dataset en Power BI Desktop", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const exportedBlob: { current?: Blob } = {};
    const createObjectURL = mock((blob: Blob) => {
      exportedBlob.current = blob;
      return "blob:powerbi";
    });
    const revokeObjectURL = mock(() => undefined);

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const originalCreateElement = document.createElement.bind(document);
    const linkClick = mock(() => undefined);
    let downloadName = "";
    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        element.click = () => {
          linkClick();
          downloadName = (element as HTMLAnchorElement).download;
        };
      }
      return element;
    }) as typeof document.createElement;

    try {
      const view = renderReportes();
      await user.click(view.getByRole("button", { name: "Descargar archivo Power BI" }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(linkClick).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:powerbi");
      expect(downloadName.endsWith(".pbids")).toBe(true);
      expect(exportedBlob.current).toBeTruthy();

      if (!exportedBlob.current) {
        throw new Error("No se genero el archivo PBIDS");
      }

      const pbids = await exportedBlob.current.text();
      expect(pbids).toContain('"version": "0.1"');
      expect(pbids).toContain('"protocol": "http"');
      expect(pbids).toContain("/api/powerbi/compras/csv");
      expect(pbids).toContain("powerbi_key=");
      expect(pbids).toContain('"mode": "Import"');
    } finally {
      document.createElement = originalCreateElement;
    }
  });
});
