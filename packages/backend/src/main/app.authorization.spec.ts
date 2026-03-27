import { describe, expect, test } from "bun:test";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { Articulo } from "src/domain/entities/Articulo";
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
        eliminarOrdenCompraUseCase: {
          async execute() {},
        },
      };
    },
  };
};

describe("app authorization", () => {
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
