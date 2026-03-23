export interface RegistrarPagoDto {
  cuentaPorPagarId: string;
  monto: number;
  fechaPago: Date;
  referencia?: string;
}
