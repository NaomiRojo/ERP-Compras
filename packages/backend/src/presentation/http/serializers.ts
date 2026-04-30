import type { Articulo } from "src/domain/entities/Articulo";
import type { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import type {
  Almacen,
  EstadoDocumento,
  GrupoArticulo,
  Impuesto,
  Moneda,
  RolCatalogo,
  TipoDocumento,
} from "src/domain/entities/Catalogos";
import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { Proveedor } from "src/domain/entities/Proveedor";
import type { Usuario } from "src/domain/entities/Usuario";
import type { RegistrarRecepcionOrdenCompraResult } from "src/application/use-cases/orden-compra/RegistrarRecepcionOrdenCompraUseCase";

export const proveedorResponse = (proveedor: Proveedor) => ({
  id: proveedor.props.id,
  cardCode: proveedor.props.cardCode,
  cardName: proveedor.props.cardName,
  nombreComercial: proveedor.props.nombreComercial,
  nitRut: proveedor.props.nitRut,
  email: proveedor.props.email,
  telefono: proveedor.props.telefono,
  direccion: proveedor.props.direccion,
  monedaId: proveedor.props.monedaId,
  balanceCuenta: proveedor.props.balanceCuenta,
  lineaCredito: proveedor.props.lineaCredito,
  activo: proveedor.props.activo,
});

export const articuloResponse = (articulo: Articulo) => ({
  id: articulo.props.id,
  itemCode: articulo.props.itemCode,
  itemName: articulo.props.itemName,
  descripcion: articulo.props.descripcion,
  unidadMedida: articulo.props.unidadMedida,
  costoEstandar: articulo.props.costoEstandar,
  grupoId: articulo.props.grupoId,
  impuestoId: articulo.props.impuestoId,
  activo: articulo.props.activo,
});

export const ordenCompraResponse = (ordenCompra: OrdenCompra) => ({
  id: ordenCompra.props.id,
  tipoDocId: ordenCompra.props.tipoDocId,
  docNum: ordenCompra.props.docNum,
  proveedorId: ordenCompra.props.proveedorId,
  estadoId: ordenCompra.props.estadoId,
  monedaId: ordenCompra.props.monedaId,
  fechaDocumento: ordenCompra.props.fechaDocumento,
  fechaVencimiento: ordenCompra.props.fechaVencimiento,
  subtotal: ordenCompra.props.subtotal,
  descuentoTotal: ordenCompra.props.descuentoTotal,
  impuestosTotal: ordenCompra.props.impuestosTotal,
  totalDocumento: ordenCompra.props.totalDocumento,
  comentarios: ordenCompra.props.comentarios,
  createdBy: ordenCompra.props.createdBy,
  approvedBy: ordenCompra.props.approvedBy,
  detalles: ordenCompra.props.detalles.map((detalle) => ({
    id: detalle.props.id,
    lineNum: detalle.props.lineNum,
    articuloId: detalle.props.articuloId,
    almacenId: detalle.props.almacenId,
    impuestoId: detalle.props.impuestoId,
    descripcion: detalle.props.descripcion,
    cantidadTotal: detalle.props.cantidadTotal,
    cantidadPendiente: detalle.props.cantidadPendiente,
    precioUnitario: detalle.props.precioUnitario,
    descuentoLinea: detalle.props.descuentoLinea,
    subtotalLinea: detalle.props.subtotalLinea,
    totalLinea: detalle.props.totalLinea,
    baseTipoDocId: detalle.props.baseTipoDocId,
    baseEntry: detalle.props.baseEntry,
    baseLine: detalle.props.baseLine,
  })),
});

export const recepcionOrdenCompraResponse = (result: RegistrarRecepcionOrdenCompraResult) => ({
  ordenCompra: ordenCompraResponse(result.ordenCompra),
  recepcion: ordenCompraResponse(result.recepcion),
});

export const cuentaPorPagarResponse = (cuentaPorPagar: CuentaPorPagar) => ({
  id: cuentaPorPagar.props.id,
  compraId: cuentaPorPagar.props.compraId,
  proveedorId: cuentaPorPagar.props.proveedorId,
  numeroFactura: cuentaPorPagar.props.numeroFactura,
  montoTotal: cuentaPorPagar.props.montoTotal,
  saldoPendiente: cuentaPorPagar.props.saldoPendiente,
  fechaVencimiento: cuentaPorPagar.props.fechaVencimiento,
  estado: cuentaPorPagar.props.estado,
});

export const pagoProveedorResponse = (pagoProveedor: PagoProveedor) => ({
  id: pagoProveedor.props.id,
  cuentaPorPagarId: pagoProveedor.props.cuentaPorPagarId,
  proveedorId: pagoProveedor.props.proveedorId,
  monto: pagoProveedor.props.monto,
  fechaPago: pagoProveedor.props.fechaPago,
  referencia: pagoProveedor.props.referencia,
  createdBy: pagoProveedor.props.createdBy,
});

export const inventarioStockResponse = (stock: ArticuloAlmacenStock) => ({
  id: stock.props.id,
  articuloId: stock.props.articuloId,
  almacenId: stock.props.almacenId,
  stockFisico: stock.props.stockFisico,
  comprometido: stock.props.comprometido,
  solicitado: stock.props.solicitado,
  stockDisponible: stock.props.stockDisponible,
});

export const inventarioMovimientoResponse = (movimiento: DiarioInventarioMovimiento) => ({
  id: movimiento.props.id,
  articuloId: movimiento.props.articuloId,
  almacenId: movimiento.props.almacenId,
  docReferenciaId: movimiento.props.docReferenciaId,
  tipoMovimiento: movimiento.props.tipoMovimiento,
  cantidad: movimiento.props.cantidad,
  costoMomento: movimiento.props.costoMomento,
  usuarioId: movimiento.props.usuarioId,
  fecha: movimiento.props.fecha,
  comentario: movimiento.props.comentario,
});

export const auditoriaEventoResponse = (evento: AuditoriaEvento) => ({
  id: evento.props.id,
  usuarioId: evento.props.usuarioId,
  entidad: evento.props.entidad,
  entidadId: evento.props.entidadId,
  accion: evento.props.accion,
  datosAntes: evento.props.datosAntes,
  datosDespues: evento.props.datosDespues,
  ipOrigen: evento.props.ipOrigen,
  fecha: evento.props.fecha,
});

export const usuarioResponse = (usuario: Usuario) => ({
  id: usuario.props.id,
  username: usuario.props.username,
  nombreCompleto: usuario.props.nombreCompleto,
  email: usuario.props.email,
  rolId: usuario.props.rolId,
  activo: usuario.props.activo,
  twoFactorEnabled: usuario.props.twoFactorEnabled,
});

export const rolCatalogoResponse = (rol: RolCatalogo) => ({
  id: rol.props.id,
  codigo: rol.props.codigo,
  nombre: rol.props.nombre,
});

export const monedaResponse = (moneda: Moneda) => ({
  id: moneda.props.id,
  codigo: moneda.props.codigo,
  nombre: moneda.props.nombre,
  tasaActual: moneda.props.tasaActual,
});

export const impuestoResponse = (impuesto: Impuesto) => ({
  id: impuesto.props.id,
  taxCode: impuesto.props.taxCode,
  nombre: impuesto.props.nombre,
  porcentaje: impuesto.props.porcentaje,
  activo: impuesto.props.activo,
});

export const grupoArticuloResponse = (grupo: GrupoArticulo) => ({
  id: grupo.props.id,
  codigo: grupo.props.codigo,
  nombre: grupo.props.nombre,
});

export const almacenResponse = (almacen: Almacen) => ({
  id: almacen.props.id,
  nombre: almacen.props.nombre,
  ubicacion: almacen.props.ubicacion,
  activo: almacen.props.activo,
});

export const estadoDocumentoResponse = (estado: EstadoDocumento) => ({
  id: estado.props.id,
  codigo: estado.props.codigo,
  nombre: estado.props.nombre,
});

export const tipoDocumentoResponse = (tipo: TipoDocumento) => ({
  id: tipo.props.id,
  codigo: tipo.props.codigo,
  nombre: tipo.props.nombre,
  afectaInventario: tipo.props.afectaInventario,
});
