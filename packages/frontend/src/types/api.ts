export type AuthLoginResponse =
  | {
      requiresTwoFactor: true;
      challengeId: string;
      previewCode?: string;
    }
  | {
      requiresTwoFactor: false;
      accessToken: string;
      refreshToken: string;
    };

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ResendTwoFactorResponse = {
  challengeId: string;
  previewCode?: string;
};

export type UsuarioApi = {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rolId: number;
  activo: boolean;
  twoFactorEnabled: boolean;
};

export type RolCatalogoApi = {
  id: number;
  codigo: string;
  nombre: string;
};

export type MonedaApi = {
  id: number;
  codigo: string;
  nombre: string;
  tasaActual: number;
};

export type ImpuestoApi = {
  id: number;
  taxCode: string;
  nombre: string;
  porcentaje: number;
  activo: boolean;
};

export type GrupoArticuloApi = {
  id: number;
  codigo: string;
  nombre: string;
};

export type AlmacenApi = {
  id: string;
  nombre: string;
  ubicacion: string | null;
  activo: boolean;
};

export type EstadoDocumentoApi = {
  id: number;
  codigo: string;
  nombre: string;
};

export type TipoDocumentoApi = {
  id: number;
  codigo: string;
  nombre: string;
  afectaInventario: boolean;
};

export type ProveedorApi = {
  id: string;
  cardCode: string;
  cardName: string;
  nombreComercial?: string;
  nitRut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  monedaId: number;
  balanceCuenta: number;
  lineaCredito: number;
  activo: boolean;
};

export type ArticuloApi = {
  id: string;
  itemCode: string;
  itemName: string;
  descripcion?: string;
  unidadMedida: string;
  costoEstandar: number;
  grupoId: number;
  impuestoId: number;
  activo: boolean;
};

export type OrdenCompraDetalleApi = {
  id: string;
  lineNum: number;
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion?: string;
  cantidadTotal: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuentoLinea: number;
  subtotalLinea: number;
  totalLinea: number;
  baseTipoDocId?: number;
  baseEntry?: string;
  baseLine?: number;
};

export type OrdenCompraApi = {
  id: string;
  tipoDocId: number;
  docNum: number;
  proveedorId: string;
  estadoId: number;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento?: string;
  subtotal: number;
  descuentoTotal: number;
  impuestosTotal: number;
  totalDocumento: number;
  comentarios?: string;
  createdBy: string;
  approvedBy?: string;
  detalles: OrdenCompraDetalleApi[];
};

export type CuentaPorPagarApi = {
  id: string;
  compraId: string;
  proveedorId: string;
  numeroFactura: string;
  montoTotal: number;
  saldoPendiente: number;
  fechaVencimiento: string;
  estado: string;
};

export type PagoProveedorApi = {
  id: string;
  cuentaPorPagarId: string;
  proveedorId: string;
  monto: number;
  fechaPago: string;
  referencia?: string;
  createdBy: string;
};

export type InventarioStockApi = {
  id: string;
  articuloId: string;
  almacenId: string;
  stockFisico: number;
  comprometido: number;
  solicitado: number;
  stockDisponible: number;
};

export type InventarioMovimientoApi = {
  id: string;
  articuloId: string;
  almacenId: string;
  docReferenciaId: string;
  tipoMovimiento: "IN" | "OUT";
  cantidad: number;
  costoMomento: number;
  usuarioId: string;
  fecha: string;
  comentario?: string;
};

export type AuditoriaEventoApi = {
  id: string;
  usuarioId: string;
  entidad: string;
  entidadId?: string;
  accion: string;
  datosAntes: unknown;
  datosDespues: unknown;
  ipOrigen?: string;
  fecha: string;
};

export type CatalogosApi = {
  roles: RolCatalogoApi[];
  monedas: MonedaApi[];
  impuestos: ImpuestoApi[];
  gruposArticulo: GrupoArticuloApi[];
  almacenes: AlmacenApi[];
  estadosDocumento: EstadoDocumentoApi[];
  tiposDocumento: TipoDocumentoApi[];
};

export type CrearProveedorDto = {
  cardCode: string;
  cardName: string;
  nitRut: string;
  monedaId: number;
  nombreComercial?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  lineaCredito?: number;
};

export type CrearArticuloDto = {
  itemCode: string;
  itemName: string;
  costoEstandar: number;
  grupoId: number;
  impuestoId: number;
  descripcion?: string;
  unidadMedida?: string;
};

export type CrearCuentaPorPagarDto = {
  compraId: string;
  proveedorId: string;
  numeroFactura: string;
  montoTotal: number;
  fechaVencimiento: string;
};

export type RegistrarPagoProveedorDto = {
  monto: number;
  fechaPago: string;
  referencia?: string;
};

export type OrdenCompraDetalleInputDto = {
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion?: string;
  cantidadTotal: number;
  precioUnitario: number;
  descuentoLinea?: number;
};

export type CrearOrdenCompraDto = {
  proveedorId: string;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento?: string;
  comentarios?: string;
  detalles: OrdenCompraDetalleInputDto[];
};

export type ActualizarOrdenCompraDto = CrearOrdenCompraDto;

export type RegistrarRecepcionOrdenCompraDetalleDto = {
  lineNum: number;
  cantidadRecibida: number;
};

export type RegistrarRecepcionOrdenCompraDto = {
  fechaDocumento: string;
  comentarios?: string;
  detalles: RegistrarRecepcionOrdenCompraDetalleDto[];
};

export type RegistrarRecepcionOrdenCompraResponse = {
  ordenCompra: OrdenCompraApi;
  recepcion: OrdenCompraApi;
};

export type ERPApiData = {
  usuarios: UsuarioApi[];
  proveedores: ProveedorApi[];
  articulos: ArticuloApi[];
  ordenes: OrdenCompraApi[];
  cuentasPorPagar: CuentaPorPagarApi[];
  pagosProveedor: PagoProveedorApi[];
  inventarioStocks: InventarioStockApi[];
  inventarioMovimientos: InventarioMovimientoApi[];
  auditoriaEventos: AuditoriaEventoApi[];
  catalogos: CatalogosApi;
};

export type PowerBiOrderDetailApi = {
  lineNum: number;
  articuloId: string;
  sku: string;
  nombre: string;
  grupo: string;
  cantidadTotal: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuentoLinea: number;
  totalLinea: number;
};

export type PowerBiOrderApi = {
  id: string;
  docNum: number;
  providerId: string;
  providerName: string;
  status: string;
  currencyId: number;
  fechaDocumento: string;
  totalDocumento: number;
  subtotal: number;
  impuestosTotal: number;
  descuentoTotal: number;
  detalles: PowerBiOrderDetailApi[];
};

export type PowerBiComprasDatasetApi = {
  generatedAt: string;
  period: {
    from: string | null;
    to: string | null;
  };
  summary: {
    totalPurchases: number;
    pendingOrders: number;
    activeProviders: number;
    productsPurchased: number;
    accountsPayableBalance: number;
    paidAmount: number;
    overdueAccounts: number;
  };
  monthlyPurchases: Array<{
    month: string;
    orderCount: number;
    total: number;
  }>;
  topProviders: Array<{
    provider: string;
    orderCount: number;
    total: number;
  }>;
  topProducts: Array<{
    sku: string;
    nombre: string;
    quantity: number;
    total: number;
  }>;
  spendByCategory: Array<{
    category: string;
    total: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  orders: PowerBiOrderApi[];
};

export type PowerBiSqlTemplatesApi = {
  generatedAt: string;
  databaseEngine: string;
  notes: string[];
  queries: {
    monthlyPurchases: string;
    topProviders: string;
    topProducts: string;
    spendByCategory: string;
  };
};
