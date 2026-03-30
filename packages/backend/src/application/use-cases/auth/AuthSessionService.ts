import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
import type { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";
import type { Usuario } from "src/domain/entities/Usuario";
import { RefreshTokenSesion as RefreshTokenSesionEntity } from "src/domain/entities/RefreshTokenSesion";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IRefreshTokenSesionRepository } from "src/domain/repositories/IRefreshTokenSesionRepository";
import { sha256 } from "src/shared/utils/hash";

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export type AuthLoginResponse =
  | {
      requiresTwoFactor: true;
      challengeId: string;
      previewCode?: string;
    }
  | ({
      requiresTwoFactor: false;
    } & AuthTokensResponse);

export interface IAuthSessionService {
  completeLogin(usuario: Usuario): Promise<AuthLoginResponse>;
  issueTokens(usuario: Usuario): Promise<AuthTokensResponse>;
  rotateRefreshToken(session: RefreshTokenSesion, usuario: Usuario): Promise<AuthTokensResponse>;
  validateRefreshToken(refreshToken: string): Promise<RefreshTokenSesion | null>;
}

export class AuthSessionService implements IAuthSessionService {
  public constructor(
    private readonly codigoSegundoFactorRepository: ICodigoSegundoFactorRepository,
    private readonly refreshTokenRepository: IRefreshTokenSesionRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly exposePreviewCode: boolean,
    private readonly emailService?: IEmailService,
    private readonly twoFactorEmailOverride?: string,
  ) {}

  public async completeLogin(usuario: Usuario): Promise<AuthLoginResponse> {
    if (usuario.props.twoFactorEnabled) {
      if (!this.emailService && !this.exposePreviewCode) {
        throw new Error("El segundo factor por email no esta configurado");
      }

      const challenge = await this.createSecondFactorChallenge(usuario);
      return {
        requiresTwoFactor: true,
        ...challenge,
      };
    }

    const tokens = await this.issueTokens(usuario);
    return {
      requiresTwoFactor: false,
      ...tokens,
    };
  }

  public async createSecondFactorChallenge(
    usuario: Usuario,
  ): Promise<{ challengeId: string; previewCode?: string }> {
    const challengeId = crypto.randomUUID();
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const codeHash = await this.passwordService.hash(code);
    const previewCode = this.exposePreviewCode ? code : undefined;
    const recipientEmail = this.twoFactorEmailOverride?.trim() || usuario.props.email;

    await this.codigoSegundoFactorRepository.save(
      new CodigoSegundoFactor({
        id: challengeId,
        usuarioId: usuario.props.id,
        codigoHash: codeHash,
        canal: "EMAIL",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }),
    );

    if (this.emailService) {
      try {
        await this.emailService.send({
          to: recipientEmail,
          subject: "Codigo de acceso ERP",
          text: `Tu codigo de segundo factor es ${code}. Expira en 5 minutos.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Codigo de acceso ERP</h2>
              <p>Tu codigo de segundo factor es:</p>
              <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
              <p>Este codigo expira en 5 minutos.</p>
            </div>
          `,
        });
      } catch (error) {
        await this.codigoSegundoFactorRepository.markUsed(challengeId);
        const message = error instanceof Error ? error.message : "Error SMTP desconocido";
        throw new Error(`No se pudo enviar el codigo de segundo factor por correo: ${message}`);
      }
    }

    return {
      challengeId,
      previewCode,
    };
  }

  public async issueTokens(usuario: Usuario): Promise<AuthTokensResponse> {
    const accessToken = await this.tokenService.sign({
      sub: usuario.props.id,
      email: usuario.props.email,
      roleId: usuario.props.rolId,
    });

    const refreshToken = crypto.randomUUID();
    const refreshTokenHash = await sha256(refreshToken);

    await this.refreshTokenRepository.save(
      new RefreshTokenSesionEntity({
        id: crypto.randomUUID(),
        usuarioId: usuario.props.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    );

    return { accessToken, refreshToken };
  }

  public async rotateRefreshToken(
    session: RefreshTokenSesion,
    usuario: Usuario,
  ): Promise<AuthTokensResponse> {
    await this.refreshTokenRepository.revokeById(session.props.id);
    return this.issueTokens(usuario);
  }

  public async validateRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenSesion | null> {
    return this.refreshTokenRepository.findValidByTokenHash(await sha256(refreshToken));
  }
}
