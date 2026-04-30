import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { json } from "src/presentation/http/response";
import { auditoriaEventoResponse } from "src/presentation/http/serializers";

type AuditoriaRouteDependencies = Pick<HttpDependencies, "createAuditoriaContext">;

const extractItemId = (pathname: string, basePath: string): string | null => {
  if (!pathname.startsWith(`${basePath}/`)) {
    return null;
  }

  const id = pathname.slice(basePath.length + 1);
  if (!id || id.includes("/")) {
    return null;
  }

  return id;
};

const resolveAuditoriaStatus = (message: string): number =>
  message === "Evento de auditoria no encontrado" ? 404 : 400;

export const createAuditoriaRouteHandler =
  ({ createAuditoriaContext }: AuditoriaRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method !== "GET" || !pathname.startsWith(API_ENDPOINTS.auditoria)) {
      return null;
    }

    const context = createAuditoriaContext();

    if (pathname === API_ENDPOINTS.auditoria) {
      const eventos = await context.listarAuditoriaEventosUseCase.execute();
      return json(eventos.map(auditoriaEventoResponse), 200, origin);
    }

    const eventoId = extractItemId(pathname, API_ENDPOINTS.auditoria);
    if (!eventoId) {
      return null;
    }

    try {
      const evento = await context.obtenerAuditoriaEventoUseCase.execute(eventoId);
      return json(auditoriaEventoResponse(evento), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, resolveAuditoriaStatus(message), origin);
    }
  };
