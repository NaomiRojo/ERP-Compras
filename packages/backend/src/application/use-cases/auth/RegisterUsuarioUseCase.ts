import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";

export class RegisterUsuarioUseCase {
  public constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordService: IPasswordService,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: RegisterUsuarioDto): Promise<Usuario> {
    const username = dto.username.trim();
    const nombreCompleto = dto.nombreCompleto.trim();
    const email = dto.email.trim().toLowerCase();

    if (!username || !nombreCompleto || !email || !dto.password.trim()) {
      throw new Error("username, nombreCompleto, email y password son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      if (await this.usuarioRepository.findByEmail(email)) {
        throw new Error("Ya existe un usuario con ese email");
      }

      if (await this.usuarioRepository.findByUsername(username)) {
        throw new Error("Ya existe un usuario con ese username");
      }

      const usuario = new Usuario({
        id: crypto.randomUUID(),
        username,
        nombreCompleto,
        email,
        passwordHash: await this.passwordService.hash(dto.password),
        rolId: dto.rolId ?? 2,
        activo: true,
        twoFactorEnabled: dto.twoFactorEnabled ?? true,
      });

      await this.usuarioRepository.save(usuario);
      await this.unitOfWork.commit();

      return usuario;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
