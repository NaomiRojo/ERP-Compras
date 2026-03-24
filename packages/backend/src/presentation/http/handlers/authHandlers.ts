import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { AppContainer } from "src/main/container";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import { usuarioResponse } from "src/presentation/http/serializers";

export const handleAuthRoutes = async (
  request: Request,
  pathname: string,
  origin: string | null,
  container: AppContainer,
): Promise<Response | null> => {
  if (request.method === "POST" && pathname === "/api/auth/register") {
    try {
      const authContext = container.createAuthContext();
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
      return json({ message }, 400, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    try {
      const authContext = container.createAuthContext();
      const dto = await parseJsonBody<LoginDto>(request);
      const result = await authContext.loginUsuarioUseCase.execute(dto);
      return json(result, 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 401, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/google") {
    try {
      const authContext = container.createAuthContext();
      if (!authContext.loginGoogleUseCase) {
        return json({ message: "Google auth no esta configurado" }, 503, origin);
      }

      const dto = await parseJsonBody<LoginGoogleDto>(request);
      const result = await authContext.loginGoogleUseCase.execute(dto);
      return json(result, 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 401, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/verify-2fa") {
    try {
      const authContext = container.createAuthContext();
      const dto = await parseJsonBody<VerifySecondFactorDto>(request);
      const result = await authContext.verifySegundoFactorUseCase.execute(dto);
      return json(result, 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 401, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/auth/refresh") {
    try {
      const authContext = container.createAuthContext();
      const dto = await parseJsonBody<RefreshAccessTokenDto>(request);
      const result = await authContext.verifySegundoFactorUseCase.refresh(dto);
      return json(result, 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 401, origin);
    }
  }

  if (request.method === "GET" && pathname === "/api/auth/me") {
    try {
      const authContext = container.createAuthContext();
      const auth = await authenticate(request, container.tokenService);
      const usuario = await authContext.usuarioRepository.findById(auth.userId);
      if (!usuario) {
        return json({ message: "Usuario no encontrado" }, 404, origin);
      }

      return json(usuarioResponse(usuario), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No autorizado";
      return json({ message }, 401, origin);
    }
  }

  return null;
};
