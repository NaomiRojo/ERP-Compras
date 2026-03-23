export interface CodigoSegundoFactorProps {
  id: string;
  usuarioId: string;
  codigoHash: string;
  canal: "EMAIL" | "APP";
  expiresAt: Date;
  usedAt?: Date;
}

export class CodigoSegundoFactor {
  public constructor(public readonly props: CodigoSegundoFactorProps) {}
}
