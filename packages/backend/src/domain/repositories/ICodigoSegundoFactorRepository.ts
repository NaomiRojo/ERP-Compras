import type { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";

export interface ICodigoSegundoFactorRepository {
  save(codigo: CodigoSegundoFactor): Promise<void>;
  findPendingById(id: string): Promise<CodigoSegundoFactor | null>;
  markUsed(id: string): Promise<void>;
}
