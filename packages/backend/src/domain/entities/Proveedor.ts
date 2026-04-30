export interface ProveedorProps {
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
}

export class Proveedor {
  public constructor(public readonly props: ProveedorProps) {}
}
