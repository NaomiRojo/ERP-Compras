import type { RegistrarMovimientoInventarioDto } from "src/application/dtos/inventario/RegistrarMovimientoInventarioDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import {
  movimientoInventarioResponse,
  stockArticuloResponse,
} from "src/presentation/http/serializers";

type InventarioRouteDependencies = Pick<
  HttpDependencies,
  "createInventarioContext" | "tokenService"
>;

const pathSegments = (pathname: string): string[] => pathname.split("/").filter(Boolean);

export const createInventarioRouteHandler =
  ({ createInventarioContext, tokenService }: InventarioRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    const inventarioContext = createInventarioContext();
    const segments = pathSegments(pathname);

    if (request.method === "GET" && pathname === "/api/inventario/stocks") {
      const stocks = await inventarioContext.inventarioService.listarStocks();
      return json(stocks.map(stockArticuloResponse), 200, origin);
    }

    if (
      request.method === "GET" &&
      segments.length === 4 &&
      segments[0] === "api" &&
      segments[1] === "articulos" &&
      segments[3] === "stocks"
    ) {
      try {
        const stocks = await inventarioContext.inventarioService.listarStocksPorArticulo(
          segments[2] ?? "",
        );
        return json(stocks.map(stockArticuloResponse), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    if (request.method === "GET" && pathname === "/api/inventario/movimientos") {
      const movimientos = await inventarioContext.inventarioService.listarMovimientos();
      return json(movimientos.map(movimientoInventarioResponse), 200, origin);
    }

    if (
      request.method === "GET" &&
      segments.length === 4 &&
      segments[0] === "api" &&
      segments[1] === "inventario" &&
      segments[2] === "movimientos"
    ) {
      try {
        const movimiento = await inventarioContext.inventarioService.obtenerMovimiento(
          segments[3] ?? "",
        );
        return json(movimientoInventarioResponse(movimiento), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Movimiento de inventario no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/inventario/movimientos") {
      try {
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<RegistrarMovimientoInventarioDto>(request);
        const movimiento = await inventarioContext.inventarioService.registrarMovimiento(
          dto,
          auth.userId,
        );
        return json(movimientoInventarioResponse(movimiento), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    return null;
  };
