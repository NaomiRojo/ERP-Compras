const bearerSecurityScheme = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
} as const;

const unauthorizedResponse = {
  description: "No autorizado",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
} as const;

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ERP Backend API",
    version: "1.0.0",
    description: "API REST del ERP para autenticacion, proveedores, articulos y ordenes de compra.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Usuarios" },
    { name: "Proveedores" },
    { name: "Articulos" },
    { name: "OrdenesCompra" },
  ],
  components: {
    securitySchemes: bearerSecurityScheme,
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      RegisterUsuarioDto: {
        type: "object",
        required: ["username", "nombreCompleto", "email", "password"],
        properties: {
          username: { type: "string" },
          nombreCompleto: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
          rolId: { type: "integer" },
          twoFactorEnabled: { type: "boolean" },
        },
      },
      LoginDto: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginGoogleDto: {
        type: "object",
        required: ["credential"],
        properties: {
          credential: { type: "string" },
        },
      },
      VerifySecondFactorDto: {
        type: "object",
        required: ["challengeId", "code"],
        properties: {
          challengeId: { type: "string" },
          code: { type: "string" },
        },
      },
      RefreshAccessTokenDto: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      AuthTokensResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          requiresTwoFactor: { type: "boolean" },
          challengeId: { type: "string" },
          previewCode: { type: "string" },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string" },
          nombreCompleto: { type: "string" },
          email: { type: "string", format: "email" },
          rolId: { type: "integer" },
          activo: { type: "boolean" },
          twoFactorEnabled: { type: "boolean" },
        },
      },
      Proveedor: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          cardCode: { type: "string" },
          cardName: { type: "string" },
          nombreComercial: { type: "string", nullable: true },
          nitRut: { type: "string" },
          email: { type: "string", nullable: true },
          telefono: { type: "string", nullable: true },
          direccion: { type: "string", nullable: true },
          monedaId: { type: "integer" },
          balanceCuenta: { type: "number" },
          lineaCredito: { type: "number" },
          activo: { type: "boolean" },
        },
      },
      CrearProveedorDto: {
        type: "object",
        required: ["cardCode", "cardName", "nitRut", "monedaId"],
        properties: {
          cardCode: { type: "string" },
          cardName: { type: "string" },
          nombreComercial: { type: "string" },
          nitRut: { type: "string" },
          email: { type: "string" },
          telefono: { type: "string" },
          direccion: { type: "string" },
          monedaId: { type: "integer" },
          lineaCredito: { type: "number" },
        },
      },
      Articulo: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          itemCode: { type: "string" },
          itemName: { type: "string" },
          descripcion: { type: "string", nullable: true },
          unidadMedida: { type: "string" },
          costoEstandar: { type: "number" },
          grupoId: { type: "integer" },
          impuestoId: { type: "integer" },
          activo: { type: "boolean" },
        },
      },
      CrearArticuloDto: {
        type: "object",
        required: ["itemCode", "itemName", "costoEstandar", "grupoId", "impuestoId"],
        properties: {
          itemCode: { type: "string" },
          itemName: { type: "string" },
          descripcion: { type: "string" },
          unidadMedida: { type: "string" },
          costoEstandar: { type: "number" },
          grupoId: { type: "integer" },
          impuestoId: { type: "integer" },
        },
      },
      OrdenCompraDetalleInput: {
        type: "object",
        required: ["articuloId", "almacenId", "impuestoId", "cantidadTotal", "precioUnitario"],
        properties: {
          articuloId: { type: "string", format: "uuid" },
          almacenId: { type: "string" },
          impuestoId: { type: "integer" },
          descripcion: { type: "string" },
          cantidadTotal: { type: "number" },
          precioUnitario: { type: "number" },
          descuentoLinea: { type: "number" },
        },
      },
      CrearOrdenCompraDto: {
        type: "object",
        required: ["proveedorId", "monedaId", "fechaDocumento", "detalles"],
        properties: {
          proveedorId: { type: "string", format: "uuid" },
          monedaId: { type: "integer" },
          fechaDocumento: { type: "string", format: "date" },
          fechaVencimiento: { type: "string", format: "date" },
          comentarios: { type: "string" },
          detalles: {
            type: "array",
            items: {
              $ref: "#/components/schemas/OrdenCompraDetalleInput",
            },
          },
        },
      },
      OrdenCompra: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tipoDocId: { type: "integer" },
          docNum: { type: "integer" },
          proveedorId: { type: "string", format: "uuid" },
          estadoId: { type: "integer" },
          monedaId: { type: "integer" },
          fechaDocumento: { type: "string", format: "date-time" },
          fechaVencimiento: { type: "string", format: "date-time", nullable: true },
          subtotal: { type: "number" },
          descuentoTotal: { type: "number" },
          impuestosTotal: { type: "number" },
          totalDocumento: { type: "number" },
          comentarios: { type: "string", nullable: true },
          detalles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                lineNum: { type: "integer" },
                articuloId: { type: "string", format: "uuid" },
                almacenId: { type: "string" },
                impuestoId: { type: "integer" },
                descripcion: { type: "string", nullable: true },
                cantidadTotal: { type: "number" },
                cantidadPendiente: { type: "number" },
                precioUnitario: { type: "number" },
                descuentoLinea: { type: "number" },
                subtotalLinea: { type: "number" },
                totalLinea: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
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
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterUsuarioDto",
              },
            },
          },
        },
        responses: {
          201: { description: "Usuario creado" },
          400: unauthorizedResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login con email y password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDto" },
            },
          },
        },
        responses: {
          200: { description: "Login iniciado" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Login con Google/Gmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginGoogleDto" },
            },
          },
        },
        responses: {
          200: { description: "Sesion creada o segundo factor requerido" },
          401: unauthorizedResponse,
          503: { description: "Google auth no configurado" },
        },
      },
    },
    "/api/auth/verify-2fa": {
      post: {
        tags: ["Auth"],
        summary: "Verificar segundo factor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifySecondFactorDto" },
            },
          },
        },
        responses: {
          200: { description: "Tokens emitidos" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refrescar access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshAccessTokenDto" },
            },
          },
        },
        responses: {
          200: { description: "Token refrescado" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Usuario actual" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/usuarios": {
      get: {
        tags: ["Usuarios"],
        summary: "Listar usuarios registrados",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Listado de usuarios" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/proveedores": {
      get: {
        tags: ["Proveedores"],
        summary: "Listar proveedores",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Listado de proveedores" },
          401: unauthorizedResponse,
        },
      },
      post: {
        tags: ["Proveedores"],
        summary: "Crear proveedor",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearProveedorDto" },
            },
          },
        },
        responses: {
          201: { description: "Proveedor creado" },
          400: { description: "Solicitud invalida" },
          401: unauthorizedResponse,
        },
      },
    },
    "/api/proveedores/{id}": {
      get: {
        tags: ["Proveedores"],
        summary: "Obtener proveedor",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Proveedor" },
          404: { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Proveedores"],
        summary: "Actualizar proveedor",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearProveedorDto" },
            },
          },
        },
        responses: {
          200: { description: "Proveedor actualizado" },
          404: { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Proveedores"],
        summary: "Eliminar proveedor",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Eliminado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/api/articulos": {
      get: {
        tags: ["Articulos"],
        summary: "Listar articulos",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Listado de articulos" },
          401: unauthorizedResponse,
        },
      },
      post: {
        tags: ["Articulos"],
        summary: "Crear articulo",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearArticuloDto" },
            },
          },
        },
        responses: {
          201: { description: "Articulo creado" },
          400: { description: "Solicitud invalida" },
        },
      },
    },
    "/api/articulos/{id}": {
      get: {
        tags: ["Articulos"],
        summary: "Obtener articulo",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Articulo" },
          404: { description: "No encontrado" },
        },
      },
      put: {
        tags: ["Articulos"],
        summary: "Actualizar articulo",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearArticuloDto" },
            },
          },
        },
        responses: {
          200: { description: "Articulo actualizado" },
          404: { description: "No encontrado" },
        },
      },
      delete: {
        tags: ["Articulos"],
        summary: "Eliminar articulo",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Eliminado" },
          404: { description: "No encontrado" },
        },
      },
    },
    "/api/ordenes-compra": {
      get: {
        tags: ["OrdenesCompra"],
        summary: "Listar ordenes de compra",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Listado de ordenes" },
        },
      },
      post: {
        tags: ["OrdenesCompra"],
        summary: "Crear orden de compra",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearOrdenCompraDto" },
            },
          },
        },
        responses: {
          201: { description: "Orden creada" },
          400: { description: "Solicitud invalida" },
        },
      },
    },
    "/api/ordenes-compra/{id}": {
      get: {
        tags: ["OrdenesCompra"],
        summary: "Obtener orden de compra",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Orden de compra" },
          404: { description: "No encontrada" },
        },
      },
      put: {
        tags: ["OrdenesCompra"],
        summary: "Actualizar orden de compra",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrearOrdenCompraDto" },
            },
          },
        },
        responses: {
          200: { description: "Orden actualizada" },
          404: { description: "No encontrada" },
        },
      },
      delete: {
        tags: ["OrdenesCompra"],
        summary: "Eliminar orden de compra",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Eliminada" },
          404: { description: "No encontrada" },
        },
      },
    },
  },
} as const;
