export interface CrearProveedorDto {
  cardCode: string;
  cardName: string;
  nombreComercial?: string;
  nitRut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  monedaId: number;
  lineaCredito?: number;
}
