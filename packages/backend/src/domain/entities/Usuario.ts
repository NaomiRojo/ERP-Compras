export interface UsuarioProps {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  passwordHash: string;
  googleSub?: string;
  rolId: number;
  activo: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export class Usuario {
  public constructor(public readonly props: UsuarioProps) {}
}
