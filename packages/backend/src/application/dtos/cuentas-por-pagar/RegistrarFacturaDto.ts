export interface RegistrarFacturaDto {
  ordenCompraId: string;
  numeroFactura: string;
  montoTotal: number;
  fechaVencimiento: Date;
}
