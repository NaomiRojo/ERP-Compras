import type { HttpDependencies } from "src/presentation/http/dependencies";
import { json } from "src/presentation/http/response";
import { auditoriaEventoResponse } from "src/presentation/http/serializers";

type AuditoriaRouteDependencies = Pick<HttpDependencies, "createAuditoriaContext">;

const pathSegments = (pathname: string): string[] => pathname.split("/").filter(Boolean);

export const createAuditoriaRouteHandler =
  ({ createAuditoriaContext }: AuditoriaRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    const auditoriaContext = createAuditoriaContext();
    const segments = pathSegments(pathname);

    if (request.method === "GET" && pathname === "/api/auditoria-eventos") {
      const eventos = await auditoriaContext.auditoriaQueryService.listarEventos();
      return json(eventos.map(auditoriaEventoResponse), 200, origin);
    }

    if (
      request.method === "GET" &&
      segments.length === 3 &&
      segments[0] === "api" &&
      segments[1] === "auditoria-eventos"
    ) {
      try {
        const evento = await auditoriaContext.auditoriaQueryService.obtenerEvento(
          segments[2] ?? "",
        );
        return json(auditoriaEventoResponse(evento), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Evento de auditoria no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    return null;
  };
