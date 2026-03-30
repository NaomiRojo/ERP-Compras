import type { HttpDependencies } from "src/presentation/http/dependencies";
import { json } from "src/presentation/http/response";
import {
  almacenResponse,
  estadoDocumentoResponse,
  grupoArticuloResponse,
  impuestoResponse,
  monedaResponse,
  rolCatalogoResponse,
  tipoDocumentoResponse,
} from "src/presentation/http/serializers";

type CatalogoRouteDependencies = Pick<HttpDependencies, "createCatalogoContext">;

export const createCatalogoRouteHandler =
  ({ createCatalogoContext }: CatalogoRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method !== "GET") {
      return null;
    }

    const catalogoContext = createCatalogoContext();

    if (pathname === "/api/catalogos/roles") {
      return json(
        (await catalogoContext.catalogoQueryService.listarRoles()).map(rolCatalogoResponse),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/monedas") {
      return json(
        (await catalogoContext.catalogoQueryService.listarMonedas()).map(monedaResponse),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/impuestos") {
      return json(
        (await catalogoContext.catalogoQueryService.listarImpuestos()).map(impuestoResponse),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/grupos-articulo") {
      return json(
        (await catalogoContext.catalogoQueryService.listarGruposArticulo()).map(
          grupoArticuloResponse,
        ),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/almacenes") {
      return json(
        (await catalogoContext.catalogoQueryService.listarAlmacenes()).map(almacenResponse),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/estados-documento") {
      return json(
        (await catalogoContext.catalogoQueryService.listarEstadosDocumento()).map(
          estadoDocumentoResponse,
        ),
        200,
        origin,
      );
    }

    if (pathname === "/api/catalogos/tipos-documento") {
      return json(
        (await catalogoContext.catalogoQueryService.listarTiposDocumento()).map(
          tipoDocumentoResponse,
        ),
        200,
        origin,
      );
    }

    return null;
  };
