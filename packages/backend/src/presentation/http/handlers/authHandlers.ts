import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { ResendSecondFactorDto } from "src/application/dtos/auth/ResendSecondFactorDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import { usuarioResponse } from "src/presentation/http/serializers";
import {
  validateLoginDto,
  validateLoginGoogleDto,
  validateRefreshAccessTokenDto,
  validateResendSecondFactorDto,
  validateRegisterUsuarioDto,
  validateVerifySecondFactorDto,
} from "src/presentation/http/validators";

type AuthRouteDependencies = Pick<HttpDependencies, "createAuthContext" | "tokenService">;

const resolveAuthErrorStatus = (message: string): number => {
  if (
    message === "username, nombreCompleto, email y password son obligatorios" ||
    message === "email y password son obligatorios" ||
    message === "credential es obligatorio" ||
    message === "challengeId y code son obligatorios" ||
    message === "challengeId es obligatorio" ||
    message === "El canal de segundo factor no admite reenvio" ||
    message === "refreshToken es obligatorio" ||
    message === "twoFactorPhoneNumber es obligatorio para SMS, WHATSAPP o VOICE" ||
    message === "twoFactorChannel debe ser EMAIL, SMS, WHATSAPP o VOICE"
  ) {
    return 400;
  }

  if (
    message === "Credenciales invalidas" ||
    message === "El codigo de segundo factor no es valido" ||
    message === "Refresh token invalido" ||
    message === "La cuenta de Google no tiene email verificado"
  ) {
    return 401;
  }

  if (message === "Solo se permiten cuentas Gmail o Google Workspace") {
    return 403;
  }

  if (message === "Usuario no disponible") {
    return 404;
  }

  if (message === "El codigo de segundo factor expiro") {
    return 410;
  }

  if (
    message === "El segundo factor por email no esta configurado" ||
    message.startsWith("No se pudo enviar el codigo de segundo factor por correo") ||
    message === "El segundo factor por SMS no esta configurado" ||
    message === "El segundo factor por WhatsApp no esta configurado" ||
    message === "El segundo factor por llamada no esta configurado" ||
    message.startsWith("No se pudo enviar el codigo de segundo factor por SMS") ||
    message.startsWith("No se pudo enviar el codigo de segundo factor por WhatsApp") ||
    message.startsWith("No se pudo enviar el codigo de segundo factor por llamada") ||
    message === "Google auth no esta configurado"
  ) {
    return 503;
  }

  return 400;
};

export const createAuthRouteHandler =
  ({ createAuthContext, tokenService }: AuthRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.register) {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<RegisterUsuarioDto>(request, validateRegisterUsuarioDto);
        const usuario = await authContext.registerUsuarioUseCase.execute(dto);

        return json(
          {
            id: usuario.props.id,
            username: usuario.props.username,
            email: usuario.props.email,
            rolId: usuario.props.rolId,
          },
          201,
          origin,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.login) {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<LoginDto>(request, validateLoginDto);
        const result = await authContext.loginUsuarioUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.google) {
      try {
        const authContext = createAuthContext();
        if (!authContext.loginGoogleUseCase) {
          return json({ message: "Google auth no esta configurado" }, 503, origin);
        }

        const dto = await parseJsonBody<LoginGoogleDto>(request, validateLoginGoogleDto);
        const result = await authContext.loginGoogleUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.verifySecondFactor) {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<VerifySecondFactorDto>(request, validateVerifySecondFactorDto);
        const result = await authContext.verifySegundoFactorUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.resendSecondFactor) {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<ResendSecondFactorDto>(
          request,
          validateResendSecondFactorDto,
        );
        const result = await authContext.verifySegundoFactorUseCase.resend(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.auth.refresh) {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<RefreshAccessTokenDto>(request, validateRefreshAccessTokenDto);
        const result = await authContext.verifySegundoFactorUseCase.refresh(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "GET" && pathname === API_ENDPOINTS.auth.me) {
      try {
        const authContext = createAuthContext();
        const auth = await authenticate(request, tokenService);
        const usuario = await authContext.obtenerUsuarioActualUseCase.execute(auth.userId);
        return json(usuarioResponse(usuario), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        const status = message === "Usuario no encontrado" ? 404 : 401;
        return json({ message }, status, origin);
      }
    }

    return null;
  };
