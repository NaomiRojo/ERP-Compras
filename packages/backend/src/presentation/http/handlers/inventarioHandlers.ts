import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { json } from "src/presentation/http/response";
import {
  inventarioMovimientoResponse,
  inventarioStockResponse,
} from "src/presentation/http/serializers";

type InventarioRouteDependencies = Pick<HttpDependencies, "createInventarioContext">;

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

const resolveInventarioStatus = (message: string): number =>
  message === "Movimiento de inventario no encontrado" ? 404 : 400;

export const createInventarioRouteHandler =
  ({ createInventarioContext }: InventarioRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method !== "GET") {
      return null;
    }

    const context = createInventarioContext();

    if (pathname === API_ENDPOINTS.inventario.stocks) {
      const url = new URL(request.url);
      const articuloId = url.searchParams.get("articuloId")?.trim() || undefined;
      const stocks = await context.listarStocksUseCase.execute(articuloId);
      return json(stocks.map(inventarioStockResponse), 200, origin);
    }

    if (pathname === API_ENDPOINTS.inventario.movimientos) {
      const movimientos = await context.listarMovimientosInventarioUseCase.execute();
      return json(movimientos.map(inventarioMovimientoResponse), 200, origin);
    }

    const movimientoId = extractItemId(pathname, API_ENDPOINTS.inventario.movimientos);
    if (!movimientoId) {
      return null;
    }

    try {
      const movimiento = await context.obtenerMovimientoInventarioUseCase.execute(movimientoId);
      return json(inventarioMovimientoResponse(movimiento), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, resolveInventarioStatus(message), origin);
    }
  };
