export interface RegisterUsuarioDto {
  username: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rolId?: number;
  twoFactorEnabled?: boolean;
}
