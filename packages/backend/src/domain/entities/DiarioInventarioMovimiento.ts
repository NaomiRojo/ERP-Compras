export type TipoMovimientoInventario = "IN" | "OUT";

export interface DiarioInventarioMovimientoProps {
  id: string;
  articuloId: string;
  almacenId: string;
  docReferenciaId: string;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  costoMomento: number;
  usuarioId: string;
  fecha: Date;
  comentario?: string;
}

export class DiarioInventarioMovimiento {
  public constructor(public readonly props: DiarioInventarioMovimientoProps) {}
}
