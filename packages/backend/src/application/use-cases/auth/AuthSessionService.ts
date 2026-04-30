import type { LoginSecondFactorOptions } from "src/application/dtos/auth/LoginSecondFactorOptions";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { ITwoFactorPhoneService } from "src/application/interfaces/ITwoFactorPhoneService";
import { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
import type { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";
import type { SegundoFactorCanal, SegundoFactorCanalEntrega } from "src/domain/entities/SegundoFactorCanal";
import type { Usuario } from "src/domain/entities/Usuario";
import { RefreshTokenSesion as RefreshTokenSesionEntity } from "src/domain/entities/RefreshTokenSesion";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IRefreshTokenSesionRepository } from "src/domain/repositories/IRefreshTokenSesionRepository";
import { sha256 } from "src/shared/utils/hash";

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CompleteLoginOptions extends LoginSecondFactorOptions {}

export interface SecondFactorChallengeResponse {
  challengeId: string;
  previewCode?: string;
}

export type AuthLoginResponse =
  | {
      requiresTwoFactor: true;
    } & SecondFactorChallengeResponse
  | ({
      requiresTwoFactor: false;
    } & AuthTokensResponse);

export interface IAuthSessionService {
  completeLogin(usuario: Usuario, options?: CompleteLoginOptions): Promise<AuthLoginResponse>;
  reissueSecondFactorChallenge(
    usuario: Usuario,
    previousChallenge: CodigoSegundoFactor,
  ): Promise<SecondFactorChallengeResponse>;
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
    private readonly twoFactorPhoneService?: ITwoFactorPhoneService,
    private readonly twoFactorEmailOverride?: string,
    private readonly twoFactorPhoneOverride?: string,
    private readonly defaultTwoFactorChannel: SegundoFactorCanalEntrega = "EMAIL",
  ) {}

  public async completeLogin(
    usuario: Usuario,
    options?: CompleteLoginOptions,
  ): Promise<AuthLoginResponse> {
    if (usuario.props.twoFactorEnabled) {
      const challenge = await this.createSecondFactorChallenge(usuario, options);
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
    options?: CompleteLoginOptions,
  ): Promise<SecondFactorChallengeResponse> {
    const channel = options?.twoFactorChannel ?? this.defaultTwoFactorChannel;
    const recipientEmail = this.twoFactorEmailOverride?.trim() || usuario.props.email;
    const phoneFromRequest = options?.twoFactorPhoneNumber?.trim() || undefined;
    const recipientPhone = phoneFromRequest || this.twoFactorPhoneOverride?.trim() || undefined;

    this.validateDeliveryOptions(channel, recipientPhone);

    return this.issueSecondFactorChallenge({
      usuario,
      channel,
      recipientEmail,
      recipientPhone,
    });
  }

  public async reissueSecondFactorChallenge(
    usuario: Usuario,
    previousChallenge: CodigoSegundoFactor,
  ): Promise<SecondFactorChallengeResponse> {
    const channel = this.ensureReissuableChannel(previousChallenge.props.canal);
    const storedDestination = previousChallenge.props.destino?.trim() || undefined;
    const recipientEmail = storedDestination || this.twoFactorEmailOverride?.trim() || usuario.props.email;
    const recipientPhone = channel === "EMAIL"
      ? undefined
      : storedDestination || this.twoFactorPhoneOverride?.trim() || undefined;

    this.validateDeliveryOptions(channel, recipientPhone);

    const nextChallenge = await this.issueSecondFactorChallenge({
      usuario,
      channel,
      recipientEmail,
      recipientPhone,
    });

    await this.codigoSegundoFactorRepository.markUsed(previousChallenge.props.id);
    return nextChallenge;
  }

  private async issueSecondFactorChallenge({
    usuario,
    channel,
    recipientEmail,
    recipientPhone,
  }: {
    usuario: Usuario;
    channel: SegundoFactorCanalEntrega;
    recipientEmail: string;
    recipientPhone?: string;
  }): Promise<SecondFactorChallengeResponse> {
    const challengeId = crypto.randomUUID();
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    const codeHash = await this.passwordService.hash(code);
    const previewCode = this.exposePreviewCode ? code : undefined;

    await this.codigoSegundoFactorRepository.save(
      new CodigoSegundoFactor({
        id: challengeId,
        usuarioId: usuario.props.id,
        codigoHash: codeHash,
        canal: channel,
        destino: this.resolveChallengeDestination(channel, recipientEmail, recipientPhone),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }),
    );

    try {
      if (channel === "EMAIL" && this.emailService) {
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
      }

      if (
        (channel === "SMS" || channel === "WHATSAPP" || channel === "VOICE") &&
        this.twoFactorPhoneService &&
        recipientPhone
      ) {
        await this.twoFactorPhoneService.sendCode({
          channel,
          to: recipientPhone,
          code,
        });
      }
    } catch (error) {
      await this.codigoSegundoFactorRepository.markUsed(challengeId);
      const message = error instanceof Error ? error.message : "Error de entrega desconocido";
      throw new Error(this.deliveryErrorMessage(channel, message));
    }

    return {
      challengeId,
      previewCode,
    };
  }

  private ensureReissuableChannel(channel: SegundoFactorCanal): SegundoFactorCanalEntrega {
    if (channel === "EMAIL" || channel === "SMS" || channel === "WHATSAPP" || channel === "VOICE") {
      return channel;
    }

    throw new Error("El canal de segundo factor no admite reenvio");
  }

  private resolveChallengeDestination(
    channel: SegundoFactorCanalEntrega,
    recipientEmail: string,
    recipientPhone?: string,
  ): string | undefined {
    return channel === "EMAIL" ? recipientEmail : recipientPhone;
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

  private validateDeliveryOptions(
    channel: SegundoFactorCanalEntrega,
    recipientPhone: string | undefined,
  ): void {
    if (channel === "EMAIL") {
      if (!this.emailService && !this.exposePreviewCode) {
        throw new Error("El segundo factor por email no esta configurado");
      }
      return;
    }

    if (!recipientPhone) {
      throw new Error("twoFactorPhoneNumber es obligatorio para SMS, WHATSAPP o VOICE");
    }

    if (channel === "SMS" && !this.twoFactorPhoneService && !this.exposePreviewCode) {
      throw new Error("El segundo factor por SMS no esta configurado");
    }

    if (channel === "WHATSAPP" && !this.twoFactorPhoneService && !this.exposePreviewCode) {
      throw new Error("El segundo factor por WhatsApp no esta configurado");
    }

    if (channel === "VOICE" && !this.twoFactorPhoneService && !this.exposePreviewCode) {
      throw new Error("El segundo factor por llamada no esta configurado");
    }
  }

  private deliveryErrorMessage(channel: SegundoFactorCanalEntrega, message: string): string {
    if (channel === "EMAIL") {
      return `No se pudo enviar el codigo de segundo factor por correo: ${message}`;
    }

    if (channel === "SMS") {
      return `No se pudo enviar el codigo de segundo factor por SMS: ${message}`;
    }

    if (channel === "WHATSAPP") {
      return `No se pudo enviar el codigo de segundo factor por WhatsApp: ${message}`;
    }

    return `No se pudo enviar el codigo de segundo factor por llamada: ${message}`;
  }
}
