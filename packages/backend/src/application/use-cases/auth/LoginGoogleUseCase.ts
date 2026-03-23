import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import { AuthSessionService, type AuthLoginResponse } from "./AuthSessionService";

export class LoginGoogleUseCase {
  public constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly googleIdentityService: IGoogleIdentityService,
    private readonly passwordService: IPasswordService,
    private readonly authSessionService: AuthSessionService,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: LoginGoogleDto): Promise<AuthLoginResponse> {
    const credential = dto.credential.trim();
    if (!credential) {
      throw new Error("credential es obligatorio");
    }

    const identity = await this.googleIdentityService.verifyIdToken(credential);
    if (!identity.emailVerified) {
      throw new Error("La cuenta de Google no tiene email verificado");
    }

    if (!identity.email.endsWith("@gmail.com") && !identity.hostedDomain) {
      throw new Error("Solo se permiten cuentas Gmail o Google Workspace");
    }

    await this.unitOfWork.start();

    try {
      let usuario = await this.usuarioRepository.findByGoogleSub(identity.sub);

      if (!usuario) {
        const byEmail = await this.usuarioRepository.findByEmail(identity.email);
        if (byEmail) {
          usuario = new Usuario({
            ...byEmail.props,
            googleSub: identity.sub,
          });
          await this.usuarioRepository.save(usuario);
        } else {
          usuario = await this.createUsuario(identity.email, identity.name, identity.sub);
          await this.usuarioRepository.save(usuario);
        }
      }

      const result = await this.authSessionService.completeLogin(usuario);
      await this.unitOfWork.commit();

      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }

  private async createUsuario(
    email: string,
    name: string | undefined,
    googleSub: string,
  ): Promise<Usuario> {
    const baseUsername = email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "google.user";
    let username = baseUsername;
    let suffix = 1;

    while (await this.usuarioRepository.findByUsername(username)) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    return new Usuario({
      id: crypto.randomUUID(),
      username,
      nombreCompleto: name?.trim() || email,
      email,
      passwordHash: await this.passwordService.hash(crypto.randomUUID()),
      googleSub,
      rolId: 2,
      activo: true,
      twoFactorEnabled: false,
    });
  }
}
