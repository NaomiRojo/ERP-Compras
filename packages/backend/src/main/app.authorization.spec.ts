import { describe, expect, test } from "bun:test";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { Articulo } from "src/domain/entities/Articulo";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import { PagoProveedor } from "src/domain/entities/PagoProveedor";
import { ROLE_IDS, type RoleId } from "src/domain/roles";
import { Usuario } from "src/domain/entities/Usuario";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { createApp } from "./app";

const usuarioDemo = new Usuario({
  id: "user-1",
  username: "admin",
  nombreCompleto: "Administrador ERP",
  email: "admin@erp.local",
  passwordHash: "hash",
  rolId: ROLE_IDS.ADMIN,
  activo: true,
  twoFactorEnabled: true,
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
  docNum: 10,
  proveedorId: "prov-1",
  estadoId: 5,
  monedaId: 1,
  fechaDocumento: new Date("2026-04-01T00:00:00.000Z"),
  subtotal: 90,
  descuentoTotal: 0,
  impuestosTotal: 11.7,
  totalDocumento: 101.7,
  comentarios: "Aprobada",
  createdBy: "compras-user",
  approvedBy: "user-1",
  detalles: [
    new OrdenCompraDetalle({
      id: "detail-1",
      lineNum: 0,
      articuloId: "art-1",
      almacenId: "ALM-01",
      impuestoId: 1,
      cantidadTotal: 5,
      cantidadPendiente: 3,
      precioUnitario: 18,
      descuentoLinea: 0,
      subtotalLinea: 90,
      totalLinea: 101.7,
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
});

const auditoriaEventoDemo = new AuditoriaEvento({
  id: "audit-1",
  usuarioId: "user-1",
  entidad: "cxp_cuentas_por_pagar",
  entidadId: "cxp-1",
  accion: "CREAR",
  fecha: new Date("2026-04-05T10:00:00.000Z"),
});

const createDependencies = (roleId: RoleId): HttpDependencies => {
  const tokenService: ITokenService = {
    async sign() {
      return "token";
    },
    async verify() {
      return {
        sub: "user-1",
        email: "demo@erp.local",
        roleId,
      };
    },
  };

  return {
    tokenService,
    createAuthContext() {
      return {
        listarUsuariosUseCase: {
          async execute() {
            return [usuarioDemo];
          },
        },
        obtenerUsuarioActualUseCase: {
          async execute() {
            return usuarioDemo;
          },
        },
        registerUsuarioUseCase: {
          async execute() {
            return usuarioDemo;
          },
        },
        loginUsuarioUseCase: {
          async execute() {
            return {
              requiresTwoFactor: false as const,
              accessToken: "access",
              refreshToken: "refresh",
            };
          },
        },
        verifySegundoFactorUseCase: {
          async execute() {
            return { accessToken: "access", refreshToken: "refresh" };
          },
          async resend() {
            return { challengeId: "challenge-2" };
          },
          async refresh() {
            return { accessToken: "access", refreshToken: "refresh" };
          },
        },
      };
    },
    createProveedorContext() {
      return {
        crearProveedorUseCase: {
          async execute() {
            throw new Error("Not implemented in test");
          },
        },
        listarProveedoresUseCase: {
          async execute() {
            return [];
          },
        },
        obtenerProveedorUseCase: {
          async execute() {
            throw new Error("Not implemented in test");
          },
        },
        actualizarProveedorUseCase: {
          async execute() {
            throw new Error("Not implemented in test");
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
              ordenCompra: ordenCompraAprobadaDemo,
              recepcion: new OrdenCompra({
                ...ordenCompraAprobadaDemo.props,
                id: "receipt-1",
                tipoDocId: 3,
                estadoId: 3,
                createdBy: "user-1",
              }),
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
    createCatalogoContext() {
      return {
        listarRolesUseCase: {
          async execute() {
            return [];
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
  };
};

describe("app authorization", () => {
  test("acepta preflight OPTIONS para origen permitido", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ADMIN));

    const response = await app.fetch(
      new Request("http://localhost/api/proveedores", {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:3000",
          "access-control-request-method": "GET",
          "access-control-request-headers": "authorization",
        },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
  });

  test("rechaza preflight OPTIONS para origen no permitido", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ADMIN));

    const response = await app.fetch(
      new Request("http://localhost/api/proveedores", {
        method: "OPTIONS",
        headers: {
          origin: "http://evil.local",
          "access-control-request-method": "GET",
        },
      }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    await expect(response.json()).resolves.toEqual({
      message: "CORS preflight no permitido",
    });
  });

  test("bloquea /api/usuarios para COMPRAS", async () => {
    const app = createApp(createDependencies(ROLE_IDS.COMPRAS));

    const response = await app.fetch(
      new Request("http://localhost/api/usuarios", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol COMPRAS no tiene permisos para esta accion",
    });
  });

  test("permite /api/usuarios para ADMIN", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ADMIN));

    const response = await app.fetch(
      new Request("http://localhost/api/usuarios", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: "user-1",
        username: "admin",
        nombreCompleto: "Administrador ERP",
        email: "admin@erp.local",
        rolId: 1,
        activo: true,
        twoFactorEnabled: true,
      },
    ]);
  });

  test("permite lectura de articulos para ALMACEN", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ALMACEN));

    const response = await app.fetch(
      new Request("http://localhost/api/articulos", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: "art-1",
        itemCode: "ITEM-001",
        itemName: "Articulo Demo",
        descripcion: undefined,
        unidadMedida: "UNI",
        costoEstandar: 100,
        grupoId: 1,
        impuestoId: 1,
        activo: true,
      },
    ]);
  });

  test("bloquea creacion de ordenes para ALMACEN", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ALMACEN));

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          proveedorId: "prov-1",
          monedaId: 1,
          fechaDocumento: "2026-03-26",
          detalles: [],
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol ALMACEN no tiene permisos para esta accion",
    });
  });

  test("permite aprobar ordenes para SUPERVISOR", async () => {
    const app = createApp(createDependencies(ROLE_IDS.SUPERVISOR));

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
      approvedBy: "user-1",
    });
  });

  test("bloquea aprobar ordenes para COMPRAS", async () => {
    const app = createApp(createDependencies(ROLE_IDS.COMPRAS));

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra/order-1/aprobar", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol COMPRAS no tiene permisos para esta accion",
    });
  });

  test("permite registrar recepciones para ALMACEN", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ALMACEN));

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra/order-1/recepciones", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fechaDocumento: "2026-04-02",
          detalles: [{ lineNum: 0, cantidadRecibida: 2 }],
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      recepcion: {
        id: "receipt-1",
        tipoDocId: 3,
      },
    });
  });

  test("bloquea registrar recepciones para COMPRAS", async () => {
    const app = createApp(createDependencies(ROLE_IDS.COMPRAS));

    const response = await app.fetch(
      new Request("http://localhost/api/ordenes-compra/order-1/recepciones", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fechaDocumento: "2026-04-02",
          detalles: [{ lineNum: 0, cantidadRecibida: 2 }],
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol COMPRAS no tiene permisos para esta accion",
    });
  });

  test("permite crear cuentas por pagar para COMPRAS", async () => {
    const app = createApp(createDependencies(ROLE_IDS.COMPRAS));

    const response = await app.fetch(
      new Request("http://localhost/api/cuentas-por-pagar", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
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
      numeroFactura: "FAC-001",
    });
  });

  test("bloquea crear cuentas por pagar para ALMACEN", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ALMACEN));

    const response = await app.fetch(
      new Request("http://localhost/api/cuentas-por-pagar", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          compraId: "order-1",
          proveedorId: "prov-1",
          numeroFactura: "FAC-001",
          montoTotal: 101.7,
          fechaVencimiento: "2026-04-30",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol ALMACEN no tiene permisos para esta accion",
    });
  });

  test("permite consultar auditoria para SUPERVISOR", async () => {
    const app = createApp(createDependencies(ROLE_IDS.SUPERVISOR));

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
      },
    ]);
  });

  test("bloquea auditoria para COMPRAS", async () => {
    const app = createApp(createDependencies(ROLE_IDS.COMPRAS));

    const response = await app.fetch(
      new Request("http://localhost/api/auditoria", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      message: "El rol COMPRAS no tiene permisos para esta accion",
    });
  });

  test("rechaza rutas protegidas sin token", async () => {
    const app = createApp(createDependencies(ROLE_IDS.ADMIN));

    const response = await app.fetch(new Request("http://localhost/api/proveedores"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "No autorizado",
    });
  });

  test("rechaza tokens con roleId desconocido", async () => {
    const invalidTokenService: ITokenService = {
      async sign() {
        return "token";
      },
      async verify() {
        return {
          sub: "user-1",
          email: "demo@erp.local",
          roleId: 99,
        };
      },
    };

    const app = createApp({
      ...createDependencies(ROLE_IDS.ADMIN),
      tokenService: invalidTokenService,
    });

    const response = await app.fetch(
      new Request("http://localhost/api/proveedores", {
        headers: {
          authorization: "Bearer token",
        },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Token invalido",
    });
  });
});
