import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
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
    if (request.method !== "GET" || !pathname.startsWith(API_ENDPOINTS.catalogos.base)) {
      return null;
    }

    const catalogoContext = createCatalogoContext();

    if (pathname === API_ENDPOINTS.catalogos.roles) {
      const roles = await catalogoContext.listarRolesUseCase.execute();
      return json(roles.map(rolCatalogoResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.monedas) {
      const monedas = await catalogoContext.listarMonedasUseCase.execute();
      return json(monedas.map(monedaResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.impuestos) {
      const impuestos = await catalogoContext.listarImpuestosUseCase.execute();
      return json(impuestos.map(impuestoResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.gruposArticulo) {
      const grupos = await catalogoContext.listarGruposArticuloUseCase.execute();
      return json(grupos.map(grupoArticuloResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.almacenes) {
      const almacenes = await catalogoContext.listarAlmacenesUseCase.execute();
      return json(almacenes.map(almacenResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.estadosDocumento) {
      const estados = await catalogoContext.listarEstadosDocumentoUseCase.execute();
      return json(estados.map(estadoDocumentoResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.catalogos.tiposDocumento) {
      const tipos = await catalogoContext.listarTiposDocumentoUseCase.execute();
      return json(tipos.map(tipoDocumentoResponse), 200, origin);
    }

    return null;
  };
