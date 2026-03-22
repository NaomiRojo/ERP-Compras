export interface CrearOrdenCompraDto {
  proveedorId: string;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento?: string;
  comentarios?: string;
  detalles: Array<{
    articuloId: string;
    almacenId: string;
    impuestoId: number;
    descripcion?: string;
    cantidadTotal: number;
    precioUnitario: number;
    descuentoLinea?: number;
  }>;
}
