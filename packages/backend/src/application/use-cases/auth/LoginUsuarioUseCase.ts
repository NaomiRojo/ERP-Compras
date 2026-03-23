import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import { AuthSessionService, type AuthLoginResponse } from "./AuthSessionService";

export class LoginUsuarioUseCase {
  public constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordService: IPasswordService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  public async execute(dto: LoginDto): Promise<AuthLoginResponse> {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password.trim();

    if (!email || !password) {
      throw new Error("email y password son obligatorios");
    }

    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario || !usuario.props.activo) {
      throw new Error("Credenciales invalidas");
    }

    const validPassword = await this.passwordService.verify(password, usuario.props.passwordHash);
    if (!validPassword) {
      throw new Error("Credenciales invalidas");
    }

    return this.authSessionService.completeLogin(usuario);
  }
}
