import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { RegistrarRecepcionOrdenCompraDto } from "src/application/dtos/orden-compra/RegistrarRecepcionOrdenCompraDto";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { HttpDependencies, OrdenCompraHttpContext } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { createCrudRouteHandler } from "src/presentation/http/handlers/createCrudRouteHandler";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import { ordenCompraResponse, recepcionOrdenCompraResponse } from "src/presentation/http/serializers";
import {
  validateActualizarOrdenCompraDto,
  validateCrearOrdenCompraDto,
  validateRegistrarRecepcionOrdenCompraDto,
} from "src/presentation/http/validators";

type OrdenCompraRouteDependencies = Pick<HttpDependencies, "createOrdenCompraContext" | "tokenService">;

const resolveOrdenCompraMutationStatus = (message: string): number => {
  if (message === "Orden de compra no encontrada") {
    return 404;
  }

  if (
    message === "La orden de compra ya fue aprobada" ||
    message === "Solo se pueden aprobar ordenes en estado BORRADOR" ||
    message === "Solo se pueden actualizar ordenes en estado BORRADOR" ||
    message === "Solo se pueden eliminar ordenes en estado BORRADOR" ||
    message === "Solo se pueden registrar recepciones para ordenes APROBADAS o ABIERTAS" ||
    message === "La orden de compra ya fue recibida completamente" ||
    message.includes("ya no tiene cantidad pendiente") ||
    message.includes("excede el pendiente de la linea")
  ) {
    return 409;
  }

  if (
    message === "La recepcion requiere al menos un detalle" ||
    message === "fechaDocumento es obligatorio" ||
    message === "fechaDocumento invalida" ||
    message === "Cada detalle de recepcion requiere lineNum valido" ||
    message === "Cada detalle de recepcion requiere cantidadRecibida mayor a cero" ||
    message === "No se puede recibir la misma linea mas de una vez" ||
    message.startsWith("Detalle de orden no encontrado:")
  ) {
    return 400;
  }

  return 400;
};

const extractActionItemId = (pathname: string, suffix: string): string | null => {
  const actionPrefix = `${API_ENDPOINTS.ordenesCompra}/`;

  if (!pathname.startsWith(actionPrefix) || !pathname.endsWith(suffix)) {
    return null;
  }

  const id = pathname.slice(actionPrefix.length, pathname.length - suffix.length);
  if (!id || id.includes("/")) {
    return null;
  }

  return id;
};

export const createOrdenCompraRouteHandler =
  ({ createOrdenCompraContext, tokenService }: OrdenCompraRouteDependencies) => {
  const crudHandler = createCrudRouteHandler<
    CrearOrdenCompraDto,
    ActualizarOrdenCompraDto,
    OrdenCompra,
    OrdenCompraHttpContext
  >({
    basePath: API_ENDPOINTS.ordenesCompra,
    createContext: createOrdenCompraContext,
    serialize: ordenCompraResponse,
    list: (context) => context.listarOrdenesCompraUseCase.execute(),
    getById: (context, id) => context.obtenerOrdenCompraUseCase.execute(id),
    create: async (context, dto, request) => {
      const auth = await authenticate(request, tokenService);
      return context.crearOrdenCompraUseCase.execute(dto, auth.userId);
    },
    update: async (context, id, dto, request) => {
      const auth = await authenticate(request, tokenService);
      return context.actualizarOrdenCompraUseCase.execute(id, dto, auth.userId);
    },
    remove: (context, id) => context.eliminarOrdenCompraUseCase.execute(id),
    validateCreateDto: validateCrearOrdenCompraDto,
    validateUpdateDto: validateActualizarOrdenCompraDto,
    resolveCreateStatus: () => 400,
    resolveUpdateStatus: resolveOrdenCompraMutationStatus,
    resolveDeleteStatus: resolveOrdenCompraMutationStatus,
  });

  return async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    const approveItemId = extractActionItemId(pathname, API_ENDPOINTS.ordenesCompraApproveSuffix);
    const recepcionItemId = extractActionItemId(
      pathname,
      API_ENDPOINTS.ordenesCompraRecepcionesSuffix,
    );

    if (request.method === "POST" && approveItemId) {
      try {
        const context = createOrdenCompraContext();
        const auth = await authenticate(request, tokenService);
        const orden = await context.aprobarOrdenCompraUseCase.execute(approveItemId, auth.userId);
        return json(ordenCompraResponse(orden), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveOrdenCompraMutationStatus(message), origin);
      }
    }

    if (request.method === "POST" && recepcionItemId) {
      try {
        const context = createOrdenCompraContext();
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<RegistrarRecepcionOrdenCompraDto>(
          request,
          validateRegistrarRecepcionOrdenCompraDto,
        );
        const result = await context.registrarRecepcionOrdenCompraUseCase.execute(
          recepcionItemId,
          dto,
          auth.userId,
        );
        return json(recepcionOrdenCompraResponse(result), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveOrdenCompraMutationStatus(message), origin);
      }
    }

    return crudHandler(request, pathname, origin);
  };
};
