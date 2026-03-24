import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { AppContainer } from "src/main/container";
import { json, noContent, parseJsonBody } from "src/presentation/http/response";
import { articuloResponse } from "src/presentation/http/serializers";

export const handleArticuloRoutes = async (
  request: Request,
  pathname: string,
  origin: string | null,
  container: AppContainer,
): Promise<Response | null> => {
  if (request.method === "GET" && pathname === "/api/articulos") {
    const articuloContext = container.createArticuloContext();
    const articulos = await articuloContext.listarArticulosUseCase.execute();
    return json(articulos.map(articuloResponse), 200, origin);
  }

  if (request.method === "GET" && pathname.startsWith("/api/articulos/")) {
    try {
      const articuloContext = container.createArticuloContext();
      const id = pathname.split("/").at(-1) ?? "";
      const articulo = await articuloContext.obtenerArticuloUseCase.execute(id);
      return json(articuloResponse(articulo), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 404, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/articulos") {
    try {
      const articuloContext = container.createArticuloContext();
      const dto = await parseJsonBody<CrearArticuloDto>(request);
      const articulo = await articuloContext.crearArticuloUseCase.execute(dto);
      return json(articuloResponse(articulo), 201, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message.startsWith("Ya existe") || message.includes("obligatorios") ? 400 : 500;
      return json({ message }, status, origin);
    }
  }

  if (request.method === "PUT" && pathname.startsWith("/api/articulos/")) {
    try {
      const articuloContext = container.createArticuloContext();
      const id = pathname.split("/").at(-1) ?? "";
      const dto = await parseJsonBody<CrearArticuloDto>(request);
      const articulo = await articuloContext.actualizarArticuloUseCase.execute(id, dto);
      return json(articuloResponse(articulo), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message === "Articulo no encontrado" ? 404 : 400;
      return json({ message }, status, origin);
    }
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/articulos/")) {
    try {
      const articuloContext = container.createArticuloContext();
      const id = pathname.split("/").at(-1) ?? "";
      await articuloContext.eliminarArticuloUseCase.execute(id);
      return noContent(origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message === "Articulo no encontrado" ? 404 : 400;
      return json({ message }, status, origin);
    }
  }

  return null;
};
