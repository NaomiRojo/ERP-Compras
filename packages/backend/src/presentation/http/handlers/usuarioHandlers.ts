import type { AppContainer } from "src/main/container";
import { json } from "src/presentation/http/response";
import { usuarioResponse } from "src/presentation/http/serializers";

export const handleUsuarioRoutes = async (
  request: Request,
  pathname: string,
  origin: string | null,
  container: AppContainer,
): Promise<Response | null> => {
  if (request.method === "GET" && pathname === "/api/usuarios") {
    const authContext = container.createAuthContext();
    const usuarios = await authContext.listarUsuariosUseCase.execute();
    return json(usuarios.map(usuarioResponse), 200, origin);
  }

  return null;
};
