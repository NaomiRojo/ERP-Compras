import type { SegundoFactorCanal } from "src/domain/entities/SegundoFactorCanal";

export interface CodigoSegundoFactorProps {
  id: string;
  usuarioId: string;
  codigoHash: string;
  canal: SegundoFactorCanal;
  destino?: string;
  expiresAt: Date;
  usedAt?: Date;
}

export class CodigoSegundoFactor {
  public constructor(public readonly props: CodigoSegundoFactorProps) {}
}
