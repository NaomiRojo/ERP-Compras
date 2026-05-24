import { API_ENDPOINTS, SYSTEM_ENDPOINTS } from "src/presentation/http/endpoints";
import {
  createCrudPaths,
  unauthorizedResponse,
  withJsonRequest,
  withSecurity,
} from "src/presentation/http/openapiHelpers";

const catalogListResponses = (schemaName: string, description: string) => ({
  200: {
    description,
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            $ref: `#/components/schemas/${schemaName}`,
          },
        },
      },
    },
  },
  401: unauthorizedResponse,
});

const authPaths = {
  [API_ENDPOINTS.auth.register]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Registrar usuario",
        responses: {
          201: { description: "Usuario creado" },
          400: unauthorizedResponse,
        },
      },
      "RegisterUsuarioDto",
    ),
  },
  [API_ENDPOINTS.auth.login]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Login con email y password",
        responses: {
          200: { description: "Login iniciado" },
          401: unauthorizedResponse,
          503: { description: "Canal de segundo factor no configurado" },
        },
      },
      "LoginDto",
    ),
  },
  [API_ENDPOINTS.auth.google]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Login con Google/Gmail",
        responses: {
          200: { description: "Sesion creada o segundo factor requerido" },
          401: unauthorizedResponse,
          503: { description: "Google auth o canal de segundo factor no configurado" },
        },
      },
      "LoginGoogleDto",
    ),
  },
  [API_ENDPOINTS.auth.verifySecondFactor]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Verificar segundo factor",
        responses: {
          200: { description: "Tokens emitidos" },
          401: unauthorizedResponse,
        },
      },
      "VerifySecondFactorDto",
    ),
  },
  [API_ENDPOINTS.auth.resendSecondFactor]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Reenviar codigo de segundo factor",
        responses: {
          200: { description: "Nuevo desafio 2FA emitido" },
          401: unauthorizedResponse,
          503: { description: "Canal de segundo factor no configurado" },
        },
      },
      "ResendSecondFactorDto",
    ),
  },
  [API_ENDPOINTS.auth.refresh]: {
    post: withJsonRequest(
      {
        tags: ["Auth"],
        summary: "Refrescar access token",
        responses: {
          200: { description: "Token refrescado" },
          401: unauthorizedResponse,
        },
      },
      "RefreshAccessTokenDto",
    ),
  },
  [API_ENDPOINTS.auth.me]: {
    get: withSecurity({
      tags: ["Auth"],
      summary: "Obtener usuario autenticado",
      responses: {
        200: { description: "Usuario actual" },
        401: unauthorizedResponse,
      },
    }),
  },
};

const crudPaths = {
  ...createCrudPaths({
    collectionPath: API_ENDPOINTS.proveedores,
    itemPath: API_ENDPOINTS.proveedoresById,
    tag: "Proveedores",
    listSummary: "Listar proveedores",
    listSuccessDescription: "Listado de proveedores",
    listIncludeUnauthorized: true,
    createSummary: "Crear proveedor",
    createRequestSchema: "CrearProveedorDto",
    createSuccessDescription: "Proveedor creado",
    createBadRequestDescription: "Solicitud invalida",
    createIncludeUnauthorized: true,
    getByIdSummary: "Obtener proveedor",
    getByIdSuccessDescription: "Proveedor",
    updateSummary: "Actualizar proveedor",
    updateRequestSchema: "CrearProveedorDto",
    updateSuccessDescription: "Proveedor actualizado",
    deleteSummary: "Eliminar proveedor",
    deleteSuccessDescription: "Eliminado",
    notFoundDescription: "No encontrado",
  }),
  ...createCrudPaths({
    collectionPath: API_ENDPOINTS.articulos,
    itemPath: API_ENDPOINTS.articulosById,
    tag: "Articulos",
    listSummary: "Listar articulos",
    listSuccessDescription: "Listado de articulos",
    listIncludeUnauthorized: true,
    createSummary: "Crear articulo",
    createRequestSchema: "CrearArticuloDto",
    createSuccessDescription: "Articulo creado",
    createBadRequestDescription: "Solicitud invalida",
    getByIdSummary: "Obtener articulo",
    getByIdSuccessDescription: "Articulo",
    updateSummary: "Actualizar articulo",
    updateRequestSchema: "CrearArticuloDto",
    updateSuccessDescription: "Articulo actualizado",
    deleteSummary: "Eliminar articulo",
    deleteSuccessDescription: "Eliminado",
    notFoundDescription: "No encontrado",
  }),
  ...createCrudPaths({
    collectionPath: API_ENDPOINTS.ordenesCompra,
    itemPath: API_ENDPOINTS.ordenesCompraById,
    tag: "OrdenesCompra",
    listSummary: "Listar ordenes de compra",
    listSuccessDescription: "Listado de ordenes",
    createSummary: "Crear orden de compra",
    createRequestSchema: "CrearOrdenCompraDto",
    createSuccessDescription: "Orden creada",
    createBadRequestDescription: "Solicitud invalida",
    getByIdSummary: "Obtener orden de compra",
    getByIdSuccessDescription: "Orden de compra",
    updateSummary: "Actualizar orden de compra",
    updateRequestSchema: "CrearOrdenCompraDto",
    updateSuccessDescription: "Orden actualizada",
    updateConflictDescription: "La orden no se puede actualizar en su estado actual",
    deleteSummary: "Eliminar orden de compra",
    deleteSuccessDescription: "Eliminada",
    deleteConflictDescription: "La orden no se puede eliminar en su estado actual",
    notFoundDescription: "No encontrada",
  }),
};

const catalogoPaths = {
  [API_ENDPOINTS.catalogos.roles]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar roles catalogo",
      responses: catalogListResponses("RolCatalogo", "Listado de roles"),
    }),
  },
  [API_ENDPOINTS.catalogos.monedas]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar monedas",
      responses: catalogListResponses("Moneda", "Listado de monedas"),
    }),
  },
  [API_ENDPOINTS.catalogos.impuestos]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar impuestos",
      responses: catalogListResponses("Impuesto", "Listado de impuestos"),
    }),
  },
  [API_ENDPOINTS.catalogos.gruposArticulo]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar grupos de articulo",
      responses: catalogListResponses("GrupoArticulo", "Listado de grupos de articulo"),
    }),
  },
  [API_ENDPOINTS.catalogos.almacenes]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar almacenes",
      responses: catalogListResponses("Almacen", "Listado de almacenes"),
    }),
  },
  [API_ENDPOINTS.catalogos.estadosDocumento]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar estados de documento",
      responses: catalogListResponses("EstadoDocumento", "Listado de estados de documento"),
    }),
  },
  [API_ENDPOINTS.catalogos.tiposDocumento]: {
    get: withSecurity({
      tags: ["Catalogos"],
      summary: "Listar tipos de documento",
      responses: catalogListResponses("TipoDocumento", "Listado de tipos de documento"),
    }),
  },
};

const ordenCompraActionPaths = {
  [API_ENDPOINTS.ordenesCompraApproveById]: {
    post: withSecurity({
      tags: ["OrdenesCompra"],
      summary: "Aprobar orden de compra",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Orden aprobada" },
        401: unauthorizedResponse,
        404: { description: "Orden no encontrada" },
        409: { description: "La orden no se puede aprobar en su estado actual" },
      },
    }),
  },
  [API_ENDPOINTS.ordenesCompraRecepcionesById]: {
    post: withSecurity(
      withJsonRequest(
        {
          tags: ["OrdenesCompra"],
          summary: "Registrar recepcion de mercaderia",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            201: { description: "Recepcion registrada" },
            400: { description: "Solicitud invalida" },
            401: unauthorizedResponse,
            404: { description: "Orden no encontrada" },
            409: { description: "La recepcion no se puede registrar en el estado actual" },
          },
        },
        "RegistrarRecepcionOrdenCompraDto",
      ),
    ),
  },
};

const cuentasPorPagarPaths = {
  [API_ENDPOINTS.cuentasPorPagar]: {
    get: withSecurity({
      tags: ["CuentasPorPagar"],
      summary: "Listar cuentas por pagar",
      responses: {
        200: { description: "Listado de cuentas por pagar" },
        401: unauthorizedResponse,
      },
    }),
    post: withSecurity(
      withJsonRequest(
        {
          tags: ["CuentasPorPagar"],
          summary: "Crear cuenta por pagar desde orden de compra",
          responses: {
            201: { description: "Cuenta por pagar creada" },
            400: { description: "Solicitud invalida" },
            401: unauthorizedResponse,
            404: { description: "Orden no encontrada" },
            409: { description: "La cuenta por pagar no se puede crear" },
          },
        },
        "CrearCuentaPorPagarDto",
      ),
    ),
  },
  [API_ENDPOINTS.cuentasPorPagarById]: {
    get: withSecurity({
      tags: ["CuentasPorPagar"],
      summary: "Obtener cuenta por pagar",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Cuenta por pagar" },
        401: unauthorizedResponse,
        404: { description: "Cuenta por pagar no encontrada" },
      },
    }),
  },
  [API_ENDPOINTS.cuentasPorPagarPagosById]: {
    post: withSecurity(
      withJsonRequest(
        {
          tags: ["CuentasPorPagar"],
          summary: "Registrar pago a proveedor",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            201: { description: "Pago registrado" },
            400: { description: "Solicitud invalida" },
            401: unauthorizedResponse,
            404: { description: "Cuenta por pagar no encontrada" },
            409: { description: "La cuenta por pagar no admite el pago" },
          },
        },
        "RegistrarPagoProveedorDto",
      ),
    ),
  },
  [API_ENDPOINTS.pagosProveedor]: {
    get: withSecurity({
      tags: ["PagosProveedor"],
      summary: "Listar pagos a proveedor",
      responses: {
        200: { description: "Listado de pagos" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.pagosProveedorById]: {
    get: withSecurity({
      tags: ["PagosProveedor"],
      summary: "Obtener pago a proveedor",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Pago a proveedor" },
        401: unauthorizedResponse,
        404: { description: "Pago no encontrado" },
      },
    }),
  },
};

const inventarioPaths = {
  [API_ENDPOINTS.inventario.stocks]: {
    get: withSecurity({
      tags: ["Inventario"],
      summary: "Listar stocks por articulo y almacen",
      parameters: [
        {
          name: "articuloId",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Listado de stocks" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.inventario.movimientos]: {
    get: withSecurity({
      tags: ["Inventario"],
      summary: "Listar movimientos de inventario",
      responses: {
        200: { description: "Listado de movimientos" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.inventario.movimientosById]: {
    get: withSecurity({
      tags: ["Inventario"],
      summary: "Obtener movimiento de inventario",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Movimiento de inventario" },
        401: unauthorizedResponse,
        404: { description: "Movimiento no encontrado" },
      },
    }),
  },
};

const auditoriaPaths = {
  [API_ENDPOINTS.auditoria]: {
    get: withSecurity({
      tags: ["Auditoria"],
      summary: "Listar eventos de auditoria",
      responses: {
        200: { description: "Listado de eventos" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.auditoriaById]: {
    get: withSecurity({
      tags: ["Auditoria"],
      summary: "Obtener evento de auditoria",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Evento de auditoria" },
        401: unauthorizedResponse,
        404: { description: "Evento no encontrado" },
      },
    }),
  },
};

const powerBiPaths = {
  [API_ENDPOINTS.powerBi.compras]: {
    get: withSecurity({
      tags: ["PowerBI"],
      summary: "Dataset analitico de compras para Power BI (JSON)",
      parameters: [
        {
          name: "from",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
        {
          name: "to",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
      ],
      responses: {
        200: {
          description: "Dataset listo para consumo analitico",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PowerBiComprasDataset",
              },
            },
          },
        },
        400: { description: "Rango de fechas invalido" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.powerBi.comprasCsv]: {
    get: withSecurity({
      tags: ["PowerBI"],
      summary: "Exportacion CSV de compras para Power BI",
      parameters: [
        {
          name: "from",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
        {
          name: "to",
          in: "query",
          required: false,
          schema: { type: "string", format: "date" },
        },
      ],
      responses: {
        200: {
          description: "CSV generado",
          content: {
            "text/csv": {
              schema: {
                type: "string",
              },
            },
          },
        },
        400: { description: "Rango de fechas invalido" },
        401: unauthorizedResponse,
      },
    }),
  },
  [API_ENDPOINTS.powerBi.comprasSql]: {
    get: withSecurity({
      tags: ["PowerBI"],
      summary: "Plantillas SQL para modelo analitico de compras",
      responses: {
        200: {
          description: "Consultas SQL recomendadas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PowerBiSqlTemplates",
              },
            },
          },
        },
        401: unauthorizedResponse,
      },
    }),
  },
};

export const openApiPaths = {
  [SYSTEM_ENDPOINTS.health]: {
    get: {
      tags: ["Health"],
      summary: "Verifica el estado del backend",
      responses: {
        200: {
          description: "OK",
        },
      },
    },
  },
  [SYSTEM_ENDPOINTS.ready]: {
    get: {
      tags: ["Health"],
      summary: "Verifica disponibilidad de dependencias del backend",
      responses: {
        200: { description: "Servicio listo" },
        503: { description: "Servicio degradado" },
      },
    },
  },
  ...authPaths,
  [API_ENDPOINTS.usuarios]: {
    get: withSecurity({
      tags: ["Usuarios"],
      summary: "Listar usuarios registrados",
      responses: {
        200: { description: "Listado de usuarios" },
        401: unauthorizedResponse,
      },
    }),
  },
  ...catalogoPaths,
  ...ordenCompraActionPaths,
  ...cuentasPorPagarPaths,
  ...inventarioPaths,
  ...auditoriaPaths,
  ...powerBiPaths,
  ...crudPaths,
} as const;
