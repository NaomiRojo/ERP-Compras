import type { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";

export interface IDiarioInventarioRepository {
  findById(id: string): Promise<DiarioInventarioMovimiento | null>;
  listAll(): Promise<DiarioInventarioMovimiento[]>;
  save(movimiento: DiarioInventarioMovimiento): Promise<void>;
}
