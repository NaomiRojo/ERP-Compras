import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";

export interface ICuentaPorPagarRepository {
  save(cuenta: CuentaPorPagar): Promise<void>;
  findById(id: string): Promise<CuentaPorPagar | null>;
}
