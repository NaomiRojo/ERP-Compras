import type { TipoMovimientoInventario } from "src/domain/entities/DiarioInventarioMovimiento";

export interface RegistrarMovimientoInventarioDto {
  articuloId: string;
  almacenId: string;
  docReferenciaId: string;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  costoMomento: number;
  comentario?: string;
}
