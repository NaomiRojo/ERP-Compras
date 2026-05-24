import { describe, expect, test } from "bun:test";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { Articulo } from "src/domain/entities/Articulo";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { RolCatalogo } from "src/domain/entities/Catalogos";
import { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import { PagoProveedor } from "src/domain/entities/PagoProveedor";
import { Proveedor } from "src/domain/entities/Proveedor";
import { ROLE_IDS } from "src/domain/roles";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { createApp } from "./app";

const tokenService: ITokenService = {
  async sign() {
    return "token";
  },
  async verify() {
    return {
      sub: "user-1",
      email: "admin@erp.local",
      roleId: ROLE_IDS.ADMIN,
    };
  },
};

const proveedorDemo = new Proveedor({
  id: "prov-1",
  cardCode: "P-001",
  cardName: "Proveedor Demo",
  nitRut: "123456",
  monedaId: 1,
  balanceCuenta: 0,
  lineaCredito: 0,
  activo: true,
});

const articuloDemo = new Articulo({
  id: "art-1",
  itemCode: "ITEM-001",
  itemName: "Articulo Demo",
  unidadMedida: "UNI",
  costoEstandar: 100,
  grupoId: 1,
  impuestoId: 1,
  activo: true,
});

const ordenCompraAprobadaDemo = new OrdenCompra({
  id: "order-1",
  tipoDocId: 2,
  docNum: 15,
  proveedorId: "prov-1",
  estadoId: 5,
  monedaId: 1,
  fechaDocumento: new Date("2026-04-01T00:00:00.000Z"),
  subtotal: 90,
  descuentoTotal: 0,
  impuestosTotal: 11.7,
  totalDocumento: 101.7,
  comentarios: "Aprobada para compra",
  createdBy: "buyer-user",
  approvedBy: "user-1",
  detalles: [
    new OrdenCompraDetalle({
      id: "detail-1",
      lineNum: 0,
      articuloId: "art-1",
      almacenId: "ALM-01",
      impuestoId: 1,
      cantidadTotal: 5,
      cantidadPendiente: 5,
      precioUnitario: 18,
      descuentoLinea: 0,
      subtotalLinea: 90,
      totalLinea: 101.7,
    }),
  ],
});

const recepcionDemo = new OrdenCompra({
  id: "receipt-1",
  tipoDocId: 3,
  docNum: 1,
  proveedorId: "prov-1",
  estadoId: 3,
  monedaId: 1,
  fechaDocumento: new Date("2026-04-02T00:00:00.000Z"),
  subtotal: 36,
  descuentoTotal: 0,
  impuestosTotal: 4.68,
  totalDocumento: 40.68,
  comentarios: "Recepcion parcial",
  createdBy: "user-1",
  detalles: [
    new OrdenCompraDetalle({
      id: "receipt-detail-1",
      lineNum: 0,
      articuloId: "art-1",
      almacenId: "ALM-01",
      impuestoId: 1,
      cantidadTotal: 2,
      cantidadPendiente: 0,
      precioUnitario: 18,
      descuentoLinea: 0,
      subtotalLinea: 36,
      totalLinea: 40.68,
      baseTipoDocId: 2,
      baseEntry: "order-1",
      baseLine: 0,
    }),
  ],
});

const cuentaPorPagarDemo = new CuentaPorPagar({
  id: "cxp-1",
  compraId: "order-1",
  proveedorId: "prov-1",
  numeroFactura: "FAC-001",
  montoTotal: 101.7,
  saldoPendiente: 101.7,
  fechaVencimiento: new Date("2026-04-30T00:00:00.000Z"),
  estado: "PENDIENTE",
});

const pagoProveedorDemo = new PagoProveedor({
  id: "pay-1",
  cuentaPorPagarId: "cxp-1",
  proveedorId: "prov-1",
  monto: 50,
  fechaPago: new Date("2026-04-05T10:00:00.000Z"),
  referencia: "TRX-001",
  createdBy: "user-1",
});

const stockDemo = new ArticuloAlmacenStock({
  id: "stock-1",
  articuloId: "art-1",
  almacenId: "ALM-01",
  stockFisico: 2,
  comprometido: 0,
  solicitado: 0,
  stockDisponible: 2,
});

const movimientoInventarioDemo = new DiarioInventarioMovimiento({
  id: "mov-1",
  articuloId: "art-1",
  almacenId: "ALM-01",
  docReferenciaId: "receipt-1",
  tipoMovimiento: "IN",
  cantidad: 2,
  costoMomento: 18,
  usuarioId: "user-1",
  fecha: new Date("2026-04-02T10:00:00.000Z"),
  comentario: "Recepcion parcial",
});

const auditoriaEventoDemo = new AuditoriaEvento({
  id: "audit-1",
  usuarioId: "user-1",
  entidad: "cxp_cuentas_por_pagar",
  entidadId: "cxp-1",
  accion: "CREAR",
  datosDespues: {
    numeroFactura: "FAC-001",
    montoTotal: 101.7,
  },
  fecha: new Date("2026-04-05T10:00:00.000Z"),
});

const createDependencies = (): HttpDependencies => ({
  tokenService,
  async isReady() {
    return true;
  },
  createAuthContext() {
    return {
      listarUsuariosUseCase: {
        async execute() {
          return [];
        },
      },
      obtenerUsuarioActualUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      registerUsuarioUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      loginUsuarioUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      verifySegundoFactorUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
        async resend() {
          throw new Error("Not implemented in test");
        },
        async refresh() {
          throw new Error("Not implemented in test");
        },
      },
    };
  },
  createCatalogoContext() {
    return {
      listarRolesUseCase: {
        async execute() {
          return [new RolCatalogo({ id: 1, codigo: "ADMIN", nombre: "Administrador" })];
        },
      },
      listarMonedasUseCase: {
        async execute() {
          return [];
        },
      },
      listarImpuestosUseCase: {
        async execute() {
          return [];
        },
      },
      listarGruposArticuloUseCase: {
        async execute() {
          return [];
        },
      },
      listarAlmacenesUseCase: {
        async execute() {
          return [];
        },
      },
      listarEstadosDocumentoUseCase: {
        async execute() {
          return [];
        },
      },
      listarTiposDocumentoUseCase: {
        async execute() {
          return [];
        },
      },
    };
  },
  createProveedorContext() {
    return {
      crearProveedorUseCase: {
        async execute() {
          return proveedorDemo;
        },
      },
      listarProveedoresUseCase: {
        async execute() {
          return [proveedorDemo];
        },
      },
      obtenerProveedorUseCase: {
        async execute() {
          return proveedorDemo;
        },
      },
      actualizarProveedorUseCase: {
        async execute() {
          return proveedorDemo;
        },
      },
      eliminarProveedorUseCase: {
        async execute() {},
      },
    };
  },
  createArticuloContext() {
    return {
      crearArticuloUseCase: {
        async execute() {
          return articuloDemo;
        },
      },
      listarArticulosUseCase: {
        async execute() {
          return [articuloDemo];
        },
      },
      obtenerArticuloUseCase: {
        async execute() {
          return articuloDemo;
        },
      },
      actualizarArticuloUseCase: {
        async execute() {
          return articuloDemo;
        },
      },
      eliminarArticuloUseCase: {
        async execute() {},
      },
    };
  },
  createOrdenCompraContext() {
    return {
      crearOrdenCompraUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      listarOrdenesCompraUseCase: {
        async execute() {
          return [];
        },
      },
      obtenerOrdenCompraUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      actualizarOrdenCompraUseCase: {
        async execute() {
          throw new Error("Not implemented in test");
        },
      },
      aprobarOrdenCompraUseCase: {
        async execute() {
          return ordenCompraAprobadaDemo;
        },
      },
      registrarRecepcionOrdenCompraUseCase: {
        async execute() {
          return {
            ordenCompra: new OrdenCompra({
              ...ordenCompraAprobadaDemo.props,
              estadoId: 2,
              detalles: [
                new OrdenCompraDetalle({
                  ...ordenCompraAprobadaDemo.props.detalles[0]!.props,
                  cantidadPendiente: 3,
                }),
              ],
            }),
            recepcion: recepcionDemo,
          };
        },
      },
      eliminarOrdenCompraUseCase: {
        async execute() {},
      },
    };
  },
  createCuentasPorPagarContext() {
    return {
      crearCuentaPorPagarUseCase: {
        async execute() {
          return cuentaPorPagarDemo;
        },
      },
      listarCuentasPorPagarUseCase: {
        async execute() {
          return [cuentaPorPagarDemo];
        },
      },
      obtenerCuentaPorPagarUseCase: {
        async execute() {
          return cuentaPorPagarDemo;
        },
      },
      registrarPagoProveedorUseCase: {
        async execute() {
          return pagoProveedorDemo;
        },
      },
      listarPagosProveedorUseCase: {
        async execute() {
          return [pagoProveedorDemo];
        },
      },
      obtenerPagoProveedorUseCase: {
        async execute() {
          return pagoProveedorDemo;
        },
      },
    };
  },
  createInventarioContext() {
    return {
      listarStocksUseCase: {
        async execute() {
          return [stockDemo];
        },
      },
      listarMovimientosInventarioUseCase: {
        async execute() {
          return [movimientoInventarioDemo];
        },
      },
      obtenerMovimientoInventarioUseCase: {
        async execute() {
          return movimientoInventarioDemo;
        },
      },
    };
  },
  createAuditoriaContext() {
    return {
      listarAuditoriaEventosUseCase: {
        async execute() {
          return [auditoriaEventoDemo];
        },
      },
      obtenerAuditoriaEventoUseCase: {
        async execute() {
          return auditoriaEventoDemo;
        },
      },
    };
  },
});

const authorizedHeaders = () => ({
  authorization: "Bearer token",
  "content-type": "application/json",
});

describe("app http integration", () => {
  test("lista roles de catalogo", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/catalogos/roles", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { id: 1, codigo: "ADMIN", nombre: "Administrador" },
    ]);
  });

  test("valida payload invalido de proveedor", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/proveedores", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          cardCode: "P-001",
          cardName: "Proveedor Demo",
          nitRut: "123456",
          monedaId: "1",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Solicitud invalida" });
  });

  test("crea proveedor cuando payload es valido", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/proveedores", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          cardCode: "P-001",
          cardName: "Proveedor Demo",
          nitRut: "123456",
          monedaId: 1,
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: "prov-1",
      cardCode: "P-001",
      cardName: "Proveedor Demo",
      nitRut: "123456",
      monedaId: 1,
    });
  });

  test("valida payload invalido de articulo", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/articulos", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          itemCode: "ITEM-001",
          itemName: "Articulo Demo",
          costoEstandar: "100",
          grupoId: 1,
          impuestoId: 1,
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Solicitud invalida" });
  });

  test("valida payload invalido de orden de compra", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          proveedorId: "prov-1",
          monedaId: 1,
          fechaDocumento: "2026-04-01",
          detalles: [],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "proveedorId y detalles son obligatorios",
    });
  });

  test("expone /ready con 503 cuando backend esta degradado", async () => {
    const app = createApp({
      ...createDependencies(),
      async isReady() {
        return false;
      },
    });

    const response = await app.fetch(new Request("http://localhost/ready"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "degraded" });
  });

  test("aprueba una orden existente", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra/order-1/aprobar", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "order-1",
      estadoId: 5,
      createdBy: "buyer-user",
      approvedBy: "user-1",
    });
  });

  test("registra una recepcion de orden", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra/order-1/recepciones", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          fechaDocumento: "2026-04-02",
          comentarios: "Recepcion parcial",
          detalles: [{ lineNum: 0, cantidadRecibida: 2 }],
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ordenCompra: {
        id: "order-1",
        estadoId: 2,
      },
      recepcion: {
        id: "receipt-1",
        tipoDocId: 3,
        estadoId: 3,
      },
    });
  });

  test("crea una cuenta por pagar desde una orden", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/cuentas-por-pagar", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          compraId: "order-1",
          proveedorId: "prov-1",
          numeroFactura: "FAC-001",
          montoTotal: 101.7,
          fechaVencimiento: "2026-04-30",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: "cxp-1",
      compraId: "order-1",
      numeroFactura: "FAC-001",
      estado: "PENDIENTE",
    });
  });

  test("registra un pago a proveedor", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/cuentas-por-pagar/cxp-1/pagos", {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({
          monto: 50,
          fechaPago: "2026-04-05T10:00:00.000Z",
          referencia: "TRX-001",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: "pay-1",
      cuentaPorPagarId: "cxp-1",
      monto: 50,
    });
  });

  test("lista stocks de inventario", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/inventario/stocks", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: "stock-1",
        articuloId: "art-1",
        almacenId: "ALM-01",
        stockFisico: 2,
        comprometido: 0,
        solicitado: 0,
        stockDisponible: 2,
      },
    ]);
  });

  test("lista eventos de auditoria", async () => {
    const app = createApp(createDependencies());

    const response = await app.fetch(
      new Request("http://localhost/api/auditoria", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      {
        id: "audit-1",
        entidad: "cxp_cuentas_por_pagar",
        accion: "CREAR",
      },
    ]);
  });

  test("permite consumir Power BI CSV con API key por Basic auth", async () => {
    const previousApiKey = Bun.env.POWERBI_API_KEY;
    Bun.env.POWERBI_API_KEY = "test-powerbi-key";

    try {
      const app = createApp(createDependencies());
      const response = await app.fetch(
        new Request("http://localhost/api/powerbi/compras/csv", {
          headers: {
            authorization: `Basic ${btoa("test-powerbi-key:")}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/csv");
    } finally {
      if (previousApiKey === undefined) {
        Bun.env.POWERBI_API_KEY = "";
      } else {
        Bun.env.POWERBI_API_KEY = previousApiKey;
      }
    }
  });

  test("permite consumir Power BI CSV con API key por query param", async () => {
    const previousApiKey = Bun.env.POWERBI_API_KEY;
    Bun.env.POWERBI_API_KEY = "test-powerbi-key";

    try {
      const app = createApp(createDependencies());
      const response = await app.fetch(
        new Request("http://localhost/api/powerbi/compras/csv?powerbi_key=test-powerbi-key"),
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/csv");
    } finally {
      if (previousApiKey === undefined) {
        Bun.env.POWERBI_API_KEY = "";
      } else {
        Bun.env.POWERBI_API_KEY = previousApiKey;
      }
    }
  });
});
