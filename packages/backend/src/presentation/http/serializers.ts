import type { Articulo } from "src/domain/entities/Articulo";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { Proveedor } from "src/domain/entities/Proveedor";

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
  })),
});

export const usuarioResponse = (usuario: {
  props: {
    id: string;
    username: string;
    nombreCompleto: string;
    email: string;
    rolId: number;
    activo: boolean;
    twoFactorEnabled: boolean;
  };
}) => ({
  id: usuario.props.id,
  username: usuario.props.username,
  nombreCompleto: usuario.props.nombreCompleto,
  email: usuario.props.email,
  rolId: usuario.props.rolId,
  activo: usuario.props.activo,
  twoFactorEnabled: usuario.props.twoFactorEnabled,
});
