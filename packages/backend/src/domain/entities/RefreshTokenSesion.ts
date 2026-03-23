export interface RefreshTokenSesionProps {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
}

export class RefreshTokenSesion {
  public constructor(public readonly props: RefreshTokenSesionProps) {}
}
