import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { Articulo } from "src/domain/entities/Articulo";
import type { ArticuloHttpContext, HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { articuloResponse } from "src/presentation/http/serializers";
import { createCrudRouteHandler } from "src/presentation/http/handlers/createCrudRouteHandler";
import { validateCrearArticuloDto } from "src/presentation/http/validators";

type ArticuloRouteDependencies = Pick<HttpDependencies, "createArticuloContext">;

const resolveArticuloCreateStatus = (message: string): number =>
  message === "Solicitud invalida" || message.startsWith("Ya existe") || message.includes("obligatorios")
    ? 400
    : 500;

const resolveArticuloMutationStatus = (message: string): number =>
  message === "Articulo no encontrado" ? 404 : 400;

export const createArticuloRouteHandler =
  ({ createArticuloContext }: ArticuloRouteDependencies) =>
  createCrudRouteHandler<CrearArticuloDto, CrearArticuloDto, Articulo, ArticuloHttpContext>({
    basePath: API_ENDPOINTS.articulos,
    createContext: createArticuloContext,
    serialize: articuloResponse,
    list: (context) => context.listarArticulosUseCase.execute(),
    getById: (context, id) => context.obtenerArticuloUseCase.execute(id),
    create: (context, dto) => context.crearArticuloUseCase.execute(dto),
    update: (context, id, dto) => context.actualizarArticuloUseCase.execute(id, dto),
    remove: (context, id) => context.eliminarArticuloUseCase.execute(id),
    validateCreateDto: validateCrearArticuloDto,
    validateUpdateDto: validateCrearArticuloDto,
    resolveCreateStatus: resolveArticuloCreateStatus,
    resolveUpdateStatus: resolveArticuloMutationStatus,
    resolveDeleteStatus: resolveArticuloMutationStatus,
  });
