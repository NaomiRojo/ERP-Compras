export interface CrearCuentaPorPagarDto {
  compraId: string;
  proveedorId: string;
  numeroFactura: string;
  montoTotal: number;
  fechaVencimiento: string;
}
