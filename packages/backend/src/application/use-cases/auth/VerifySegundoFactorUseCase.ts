import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { ResendSecondFactorDto } from "src/application/dtos/auth/ResendSecondFactorDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import type {
  AuthTokensResponse,
  IAuthSessionService,
  SecondFactorChallengeResponse,
} from "./AuthSessionService";

export class VerifySegundoFactorUseCase {
  public constructor(
    private readonly codigoSegundoFactorRepository: ICodigoSegundoFactorRepository,
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordService: IPasswordService,
    private readonly authSessionService: IAuthSessionService,
  ) {}

  public async execute(dto: VerifySecondFactorDto): Promise<AuthTokensResponse> {
    const challengeId = dto.challengeId.trim();
    const code = dto.code.trim();

    if (!challengeId || !code) {
      throw new Error("challengeId y code son obligatorios");
    }

    const challenge = await this.codigoSegundoFactorRepository.findPendingById(challengeId);
    if (!challenge) {
      throw new Error("El codigo de segundo factor no es valido");
    }

    if (challenge.props.expiresAt.getTime() < Date.now()) {
      throw new Error("El codigo de segundo factor expiro");
    }

    const valid = await this.passwordService.verify(code, challenge.props.codigoHash);
    if (!valid) {
      throw new Error("El codigo de segundo factor no es valido");
    }

    await this.codigoSegundoFactorRepository.markUsed(challenge.props.id);

    const usuario = await this.usuarioRepository.findById(challenge.props.usuarioId);
    if (!usuario || !usuario.props.activo) {
      throw new Error("Usuario no disponible");
    }

    return this.authSessionService.issueTokens(usuario);
  }

  public async resend(dto: ResendSecondFactorDto): Promise<SecondFactorChallengeResponse> {
    const challengeId = dto.challengeId.trim();
    if (!challengeId) {
      throw new Error("challengeId es obligatorio");
    }

    const challenge = await this.codigoSegundoFactorRepository.findPendingById(challengeId);
    if (!challenge) {
      throw new Error("El codigo de segundo factor no es valido");
    }

    const usuario = await this.usuarioRepository.findById(challenge.props.usuarioId);
    if (!usuario || !usuario.props.activo) {
      throw new Error("Usuario no disponible");
    }

    return this.authSessionService.reissueSecondFactorChallenge(usuario, challenge);
  }

  public async refresh(dto: RefreshAccessTokenDto): Promise<AuthTokensResponse> {
    const refreshToken = dto.refreshToken.trim();
    if (!refreshToken) {
      throw new Error("refreshToken es obligatorio");
    }

    const session = await this.authSessionService.validateRefreshToken(refreshToken);
    if (!session) {
      throw new Error("Refresh token invalido");
    }

    const usuario = await this.usuarioRepository.findById(session.props.usuarioId);
    if (!usuario || !usuario.props.activo) {
      throw new Error("Usuario no disponible");
    }

    return this.authSessionService.rotateRefreshToken(session, usuario);
  }
}
