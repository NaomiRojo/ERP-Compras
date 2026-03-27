import type { HttpDependencies } from "src/presentation/http/dependencies";
import { json } from "src/presentation/http/response";
import { usuarioResponse } from "src/presentation/http/serializers";

type UsuarioRouteDependencies = Pick<HttpDependencies, "createAuthContext">;

export const createUsuarioRouteHandler =
  ({ createAuthContext }: UsuarioRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method === "GET" && pathname === "/api/usuarios") {
      const authContext = createAuthContext();
      const usuarios = await authContext.listarUsuariosUseCase.execute();
      return json(usuarios.map(usuarioResponse), 200, origin);
    }

    return null;
  };
