import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import { usuarioResponse } from "src/presentation/http/serializers";

type AuthRouteDependencies = Pick<HttpDependencies, "createAuthContext" | "tokenService">;

const resolveAuthErrorStatus = (message: string): number => {
  if (
    message === "username, nombreCompleto, email y password son obligatorios" ||
    message === "email y password son obligatorios" ||
    message === "credential es obligatorio" ||
    message === "challengeId y code son obligatorios" ||
    message === "refreshToken es obligatorio"
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
    if (request.method === "POST" && pathname === "/api/auth/register") {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<RegisterUsuarioDto>(request);
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

    if (request.method === "POST" && pathname === "/api/auth/login") {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<LoginDto>(request);
        const result = await authContext.loginUsuarioUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/auth/google") {
      try {
        const authContext = createAuthContext();
        if (!authContext.loginGoogleUseCase) {
          return json({ message: "Google auth no esta configurado" }, 503, origin);
        }

        const dto = await parseJsonBody<LoginGoogleDto>(request);
        const result = await authContext.loginGoogleUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/auth/verify-2fa") {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<VerifySecondFactorDto>(request);
        const result = await authContext.verifySegundoFactorUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/auth/refresh") {
      try {
        const authContext = createAuthContext();
        const dto = await parseJsonBody<RefreshAccessTokenDto>(request);
        const result = await authContext.verifySegundoFactorUseCase.refresh(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveAuthErrorStatus(message), origin);
      }
    }

    if (request.method === "GET" && pathname === "/api/auth/me") {
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
