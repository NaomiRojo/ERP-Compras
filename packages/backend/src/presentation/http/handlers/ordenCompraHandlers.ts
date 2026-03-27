import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, noContent, parseJsonBody } from "src/presentation/http/response";
import { ordenCompraResponse } from "src/presentation/http/serializers";

type OrdenCompraRouteDependencies = Pick<HttpDependencies, "createOrdenCompraContext" | "tokenService">;

export const createOrdenCompraRouteHandler =
  ({ createOrdenCompraContext, tokenService }: OrdenCompraRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method === "GET" && pathname === "/api/ordenes-compra") {
      const ordenContext = createOrdenCompraContext();
      const ordenes = await ordenContext.listarOrdenesCompraUseCase.execute();
      return json(ordenes.map(ordenCompraResponse), 200, origin);
    }

    if (request.method === "GET" && pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = createOrdenCompraContext();
        const id = pathname.split("/").at(-1) ?? "";
        const orden = await ordenContext.obtenerOrdenCompraUseCase.execute(id);
        return json(ordenCompraResponse(orden), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 404, origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/ordenes-compra") {
      try {
        const ordenContext = createOrdenCompraContext();
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<CrearOrdenCompraDto>(request);
        const orden = await ordenContext.crearOrdenCompraUseCase.execute(dto, auth.userId);
        return json(ordenCompraResponse(orden), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    if (request.method === "PUT" && pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = createOrdenCompraContext();
        const auth = await authenticate(request, tokenService);
        const id = pathname.split("/").at(-1) ?? "";
        const dto = await parseJsonBody<ActualizarOrdenCompraDto>(request);
        const orden = await ordenContext.actualizarOrdenCompraUseCase.execute(id, dto, auth.userId);
        return json(ordenCompraResponse(orden), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Orden de compra no encontrada" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "DELETE" && pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = createOrdenCompraContext();
        const id = pathname.split("/").at(-1) ?? "";
        await ordenContext.eliminarOrdenCompraUseCase.execute(id);
        return noContent(origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Orden de compra no encontrada" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    return null;
  };
