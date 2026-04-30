import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { Proveedor } from "src/domain/entities/Proveedor";
import type { HttpDependencies, ProveedorHttpContext } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { proveedorResponse } from "src/presentation/http/serializers";
import { createCrudRouteHandler } from "src/presentation/http/handlers/createCrudRouteHandler";
import { validateCrearProveedorDto } from "src/presentation/http/validators";

type ProveedorRouteDependencies = Pick<HttpDependencies, "createProveedorContext">;

const resolveProveedorCreateStatus = (message: string): number =>
  message === "Solicitud invalida" || message.startsWith("Ya existe") || message.includes("obligatorios")
    ? 400
    : 500;

const resolveProveedorMutationStatus = (message: string): number =>
  message === "Proveedor no encontrado" ? 404 : 400;

export const createProveedorRouteHandler =
  ({ createProveedorContext }: ProveedorRouteDependencies) =>
  createCrudRouteHandler<CrearProveedorDto, CrearProveedorDto, Proveedor, ProveedorHttpContext>({
    basePath: API_ENDPOINTS.proveedores,
    createContext: createProveedorContext,
    serialize: proveedorResponse,
    list: (context) => context.listarProveedoresUseCase.execute(),
    getById: (context, id) => context.obtenerProveedorUseCase.execute(id),
    create: (context, dto) => context.crearProveedorUseCase.execute(dto),
    update: (context, id, dto) => context.actualizarProveedorUseCase.execute(id, dto),
    remove: (context, id) => context.eliminarProveedorUseCase.execute(id),
    validateCreateDto: validateCrearProveedorDto,
    validateUpdateDto: validateCrearProveedorDto,
    resolveCreateStatus: resolveProveedorCreateStatus,
    resolveUpdateStatus: resolveProveedorMutationStatus,
    resolveDeleteStatus: resolveProveedorMutationStatus,
  });
