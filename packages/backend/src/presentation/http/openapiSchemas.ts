export const bearerSecurityScheme = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
} as const;

export const openApiSchemas = {
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
      twoFactorChannel: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP", "VOICE"] },
      twoFactorPhoneNumber: { type: "string", example: "+59171234567" },
    },
  },
  LoginGoogleDto: {
    type: "object",
    required: ["credential"],
    properties: {
      credential: { type: "string" },
      twoFactorChannel: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP", "VOICE"] },
      twoFactorPhoneNumber: { type: "string", example: "+59171234567" },
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
  ResendSecondFactorDto: {
    type: "object",
    required: ["challengeId"],
    properties: {
      challengeId: { type: "string" },
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
  RolCatalogo: {
    type: "object",
    properties: {
      id: { type: "integer" },
      codigo: { type: "string" },
      nombre: { type: "string" },
    },
  },
  Moneda: {
    type: "object",
    properties: {
      id: { type: "integer" },
      codigo: { type: "string" },
      nombre: { type: "string" },
      tasaActual: { type: "number" },
    },
  },
  Impuesto: {
    type: "object",
    properties: {
      id: { type: "integer" },
      taxCode: { type: "string" },
      nombre: { type: "string" },
      porcentaje: { type: "number" },
      activo: { type: "boolean" },
    },
  },
  GrupoArticulo: {
    type: "object",
    properties: {
      id: { type: "integer" },
      codigo: { type: "string" },
      nombre: { type: "string" },
    },
  },
  Almacen: {
    type: "object",
    properties: {
      id: { type: "string" },
      nombre: { type: "string" },
      ubicacion: { type: "string", nullable: true },
      activo: { type: "boolean" },
    },
  },
  EstadoDocumento: {
    type: "object",
    properties: {
      id: { type: "integer" },
      codigo: { type: "string" },
      nombre: { type: "string" },
    },
  },
  TipoDocumento: {
    type: "object",
    properties: {
      id: { type: "integer" },
      codigo: { type: "string" },
      nombre: { type: "string" },
      afectaInventario: { type: "boolean" },
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
  RegistrarRecepcionOrdenCompraDetalleDto: {
    type: "object",
    required: ["lineNum", "cantidadRecibida"],
    properties: {
      lineNum: { type: "integer" },
      cantidadRecibida: { type: "number" },
    },
  },
  RegistrarRecepcionOrdenCompraDto: {
    type: "object",
    required: ["fechaDocumento", "detalles"],
    properties: {
      fechaDocumento: { type: "string", format: "date" },
      comentarios: { type: "string" },
      detalles: {
        type: "array",
        items: {
          $ref: "#/components/schemas/RegistrarRecepcionOrdenCompraDetalleDto",
        },
      },
    },
  },
  CrearCuentaPorPagarDto: {
    type: "object",
    required: ["compraId", "proveedorId", "numeroFactura", "montoTotal", "fechaVencimiento"],
    properties: {
      compraId: { type: "string", format: "uuid" },
      proveedorId: { type: "string", format: "uuid" },
      numeroFactura: { type: "string" },
      montoTotal: { type: "number" },
      fechaVencimiento: { type: "string", format: "date" },
    },
  },
  RegistrarPagoProveedorDto: {
    type: "object",
    required: ["monto", "fechaPago"],
    properties: {
      monto: { type: "number" },
      fechaPago: { type: "string", format: "date-time" },
      referencia: { type: "string" },
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
      createdBy: { type: "string", format: "uuid" },
      approvedBy: { type: "string", format: "uuid", nullable: true },
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
            baseTipoDocId: { type: "integer", nullable: true },
            baseEntry: { type: "string", format: "uuid", nullable: true },
            baseLine: { type: "integer", nullable: true },
          },
        },
      },
    },
  },
  RegistrarRecepcionOrdenCompraResponse: {
    type: "object",
    properties: {
      ordenCompra: {
        $ref: "#/components/schemas/OrdenCompra",
      },
      recepcion: {
        $ref: "#/components/schemas/OrdenCompra",
      },
    },
  },
  CuentaPorPagar: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      compraId: { type: "string", format: "uuid" },
      proveedorId: { type: "string", format: "uuid" },
      numeroFactura: { type: "string" },
      montoTotal: { type: "number" },
      saldoPendiente: { type: "number" },
      fechaVencimiento: { type: "string", format: "date-time" },
      estado: { type: "string" },
    },
  },
  PagoProveedor: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      cuentaPorPagarId: { type: "string", format: "uuid" },
      proveedorId: { type: "string", format: "uuid" },
      monto: { type: "number" },
      fechaPago: { type: "string", format: "date-time" },
      referencia: { type: "string", nullable: true },
      createdBy: { type: "string", format: "uuid" },
    },
  },
  ArticuloAlmacenStock: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      articuloId: { type: "string", format: "uuid" },
      almacenId: { type: "string" },
      stockFisico: { type: "number" },
      comprometido: { type: "number" },
      solicitado: { type: "number" },
      stockDisponible: { type: "number" },
    },
  },
  DiarioInventarioMovimiento: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      articuloId: { type: "string", format: "uuid" },
      almacenId: { type: "string" },
      docReferenciaId: { type: "string", format: "uuid" },
      tipoMovimiento: { type: "string" },
      cantidad: { type: "number" },
      costoMomento: { type: "number" },
      usuarioId: { type: "string", format: "uuid" },
      fecha: { type: "string", format: "date-time" },
      comentario: { type: "string", nullable: true },
    },
  },
  AuditoriaEvento: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      usuarioId: { type: "string", format: "uuid" },
      entidad: { type: "string" },
      entidadId: { type: "string", format: "uuid", nullable: true },
      accion: { type: "string" },
      datosAntes: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      datosDespues: {
        type: "object",
        nullable: true,
        additionalProperties: true,
      },
      ipOrigen: { type: "string", nullable: true },
      fecha: { type: "string", format: "date-time" },
    },
  },
} as const;
