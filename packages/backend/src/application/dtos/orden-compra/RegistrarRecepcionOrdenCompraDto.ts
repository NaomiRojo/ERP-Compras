export interface RegistrarRecepcionOrdenCompraDetalleDto {
  lineNum: number;
  cantidadRecibida: number;
}

export interface RegistrarRecepcionOrdenCompraDto {
  fechaDocumento: string;
  comentarios?: string;
  detalles: RegistrarRecepcionOrdenCompraDetalleDto[];
}
