import type {
  AlmacenApi,
  ActualizarOrdenCompraDto,
  ArticuloApi,
  AuditoriaEventoApi,
  CrearArticuloDto,
  CrearCuentaPorPagarDto,
  CrearOrdenCompraDto,
  CrearProveedorDto,
  CuentaPorPagarApi,
  ERPApiData,
  EstadoDocumentoApi,
  GrupoArticuloApi,
  ImpuestoApi,
  InventarioMovimientoApi,
  InventarioStockApi,
  MonedaApi,
  OrdenCompraApi,
  PagoProveedorApi,
  ProveedorApi,
  RegistrarRecepcionOrdenCompraDto,
  RegistrarRecepcionOrdenCompraResponse,
  RegistrarPagoProveedorDto,
  RolCatalogoApi,
  TipoDocumentoApi,
  UsuarioApi,
} from "../types/api";
import { apiRequest } from "./http";

type FetchERPDataOptions = {
  roleId: number;
};

const isAdmin = (roleId: number): boolean => roleId === 1;
const isSupervisor = (roleId: number): boolean => roleId === 4;
const isCompras = (roleId: number): boolean => roleId === 2;

const canReadProveedores = (roleId: number): boolean =>
  isAdmin(roleId) || isSupervisor(roleId) || isCompras(roleId);

const canReadUsuarios = (roleId: number): boolean => isAdmin(roleId);
const canReadCxp = (roleId: number): boolean =>
  isAdmin(roleId) || isSupervisor(roleId) || isCompras(roleId);
const canReadAuditoria = (roleId: number): boolean =>
  isAdmin(roleId) || isSupervisor(roleId);

const requestIfAllowed = async <T>(
  allowed: boolean,
  request: () => Promise<T>,
  fallback: T,
): Promise<T> => {
  if (!allowed) {
    return fallback;
  }

  return request();
};

export async function fetchERPData(
  options: FetchERPDataOptions,
): Promise<ERPApiData> {
  const roleId = options.roleId;

  const [
    usuarios,
    proveedores,
    articulos,
    ordenes,
    cuentasPorPagar,
    pagosProveedor,
    inventarioStocks,
    inventarioMovimientos,
    auditoriaEventos,
    roles,
    monedas,
    impuestos,
    gruposArticulo,
    almacenes,
    estadosDocumento,
    tiposDocumento,
  ] = await Promise.all([
    requestIfAllowed(
      canReadUsuarios(roleId),
      () => apiRequest<UsuarioApi[]>("/api/usuarios"),
      [],
    ),
    requestIfAllowed(
      canReadProveedores(roleId),
      () => apiRequest<ProveedorApi[]>("/api/proveedores"),
      [],
    ),
    apiRequest<ArticuloApi[]>("/api/articulos"),
    apiRequest<OrdenCompraApi[]>("/api/ordenes-compra"),
    requestIfAllowed(
      canReadCxp(roleId),
      () => apiRequest<CuentaPorPagarApi[]>("/api/cuentas-por-pagar"),
      [],
    ),
    requestIfAllowed(
      canReadCxp(roleId),
      () => apiRequest<PagoProveedorApi[]>("/api/pagos-proveedor"),
      [],
    ),
    apiRequest<InventarioStockApi[]>("/api/inventario/stocks"),
    apiRequest<InventarioMovimientoApi[]>("/api/inventario/movimientos"),
    requestIfAllowed(
      canReadAuditoria(roleId),
      () => apiRequest<AuditoriaEventoApi[]>("/api/auditoria"),
      [],
    ),
    apiRequest<RolCatalogoApi[]>("/api/catalogos/roles"),
    apiRequest<MonedaApi[]>("/api/catalogos/monedas"),
    apiRequest<ImpuestoApi[]>("/api/catalogos/impuestos"),
    apiRequest<GrupoArticuloApi[]>("/api/catalogos/grupos-articulo"),
    apiRequest<AlmacenApi[]>("/api/catalogos/almacenes"),
    apiRequest<EstadoDocumentoApi[]>("/api/catalogos/estados-documento"),
    apiRequest<TipoDocumentoApi[]>("/api/catalogos/tipos-documento"),
  ]);

  return {
    usuarios,
    proveedores,
    articulos,
    ordenes,
    cuentasPorPagar,
    pagosProveedor,
    inventarioStocks,
    inventarioMovimientos,
    auditoriaEventos,
    catalogos: {
      roles,
      monedas,
      impuestos,
      gruposArticulo,
      almacenes,
      estadosDocumento,
      tiposDocumento,
    },
  };
}

export const createProveedor = (dto: CrearProveedorDto): Promise<ProveedorApi> =>
  apiRequest<ProveedorApi, CrearProveedorDto>("/api/proveedores", {
    method: "POST",
    body: dto,
  });

export const updateProveedor = (
  proveedorId: string,
  dto: CrearProveedorDto,
): Promise<ProveedorApi> =>
  apiRequest<ProveedorApi, CrearProveedorDto>(`/api/proveedores/${proveedorId}`, {
    method: "PUT",
    body: dto,
  });

export const deleteProveedor = (proveedorId: string): Promise<void> =>
  apiRequest<void>(`/api/proveedores/${proveedorId}`, {
    method: "DELETE",
  });

export const createArticulo = (dto: CrearArticuloDto): Promise<ArticuloApi> =>
  apiRequest<ArticuloApi, CrearArticuloDto>("/api/articulos", {
    method: "POST",
    body: dto,
  });

export const updateArticulo = (
  articuloId: string,
  dto: CrearArticuloDto,
): Promise<ArticuloApi> =>
  apiRequest<ArticuloApi, CrearArticuloDto>(`/api/articulos/${articuloId}`, {
    method: "PUT",
    body: dto,
  });

export const deleteArticulo = (articuloId: string): Promise<void> =>
  apiRequest<void>(`/api/articulos/${articuloId}`, {
    method: "DELETE",
  });

export const createOrdenCompra = (dto: CrearOrdenCompraDto): Promise<OrdenCompraApi> =>
  apiRequest<OrdenCompraApi, CrearOrdenCompraDto>("/api/ordenes-compra", {
    method: "POST",
    body: dto,
  });

export const updateOrdenCompra = (
  ordenId: string,
  dto: ActualizarOrdenCompraDto,
): Promise<OrdenCompraApi> =>
  apiRequest<OrdenCompraApi, ActualizarOrdenCompraDto>(`/api/ordenes-compra/${ordenId}`, {
    method: "PUT",
    body: dto,
  });

export const deleteOrdenCompra = (ordenId: string): Promise<void> =>
  apiRequest<void>(`/api/ordenes-compra/${ordenId}`, {
    method: "DELETE",
  });

export const approveOrdenCompra = (ordenId: string): Promise<OrdenCompraApi> =>
  apiRequest<OrdenCompraApi>(`/api/ordenes-compra/${ordenId}/aprobar`, {
    method: "POST",
  });

export const registerRecepcionOrdenCompra = (
  ordenId: string,
  dto: RegistrarRecepcionOrdenCompraDto,
): Promise<RegistrarRecepcionOrdenCompraResponse> =>
  apiRequest<RegistrarRecepcionOrdenCompraResponse, RegistrarRecepcionOrdenCompraDto>(
    `/api/ordenes-compra/${ordenId}/recepciones`,
    {
      method: "POST",
      body: dto,
    },
  );

export const createCuentaPorPagar = (
  dto: CrearCuentaPorPagarDto,
): Promise<CuentaPorPagarApi> =>
  apiRequest<CuentaPorPagarApi, CrearCuentaPorPagarDto>("/api/cuentas-por-pagar", {
    method: "POST",
    body: dto,
  });

export const registrarPagoCuentaPorPagar = (
  cuentaPorPagarId: string,
  dto: RegistrarPagoProveedorDto,
): Promise<PagoProveedorApi> =>
  apiRequest<PagoProveedorApi, RegistrarPagoProveedorDto>(
    `/api/cuentas-por-pagar/${cuentaPorPagarId}/pagos`,
    {
      method: "POST",
      body: dto,
    },
  );

export type ERPService = {
  fetchERPData: typeof fetchERPData;
  createProveedor: typeof createProveedor;
  updateProveedor: typeof updateProveedor;
  deleteProveedor: typeof deleteProveedor;
  createArticulo: typeof createArticulo;
  updateArticulo: typeof updateArticulo;
  deleteArticulo: typeof deleteArticulo;
  createOrdenCompra: typeof createOrdenCompra;
  updateOrdenCompra: typeof updateOrdenCompra;
  deleteOrdenCompra: typeof deleteOrdenCompra;
  approveOrdenCompra: typeof approveOrdenCompra;
  registerRecepcionOrdenCompra: typeof registerRecepcionOrdenCompra;
  createCuentaPorPagar: typeof createCuentaPorPagar;
  registrarPagoCuentaPorPagar: typeof registrarPagoCuentaPorPagar;
};

export const erpService: ERPService = {
  fetchERPData,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  createArticulo,
  updateArticulo,
  deleteArticulo,
  createOrdenCompra,
  updateOrdenCompra,
  deleteOrdenCompra,
  approveOrdenCompra,
  registerRecepcionOrdenCompra,
  createCuentaPorPagar,
  registrarPagoCuentaPorPagar,
};
