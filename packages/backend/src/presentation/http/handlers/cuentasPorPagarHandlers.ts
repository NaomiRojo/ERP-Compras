import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import type { RegistrarPagoProveedorDto } from "src/application/dtos/cxp/RegistrarPagoProveedorDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import { cuentaPorPagarResponse, pagoProveedorResponse } from "src/presentation/http/serializers";

type CuentasPorPagarRouteDependencies = Pick<
  HttpDependencies,
  "createCuentasPorPagarContext" | "tokenService"
>;

const pathSegments = (pathname: string): string[] => pathname.split("/").filter(Boolean);

export const createCuentasPorPagarRouteHandler =
  ({ createCuentasPorPagarContext, tokenService }: CuentasPorPagarRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    const cuentasContext = createCuentasPorPagarContext();
    const segments = pathSegments(pathname);

    if (request.method === "GET" && pathname === "/api/cuentas-por-pagar") {
      const cuentas = await cuentasContext.cuentasPorPagarService.listarCuentasPorPagar();
      return json(cuentas.map(cuentaPorPagarResponse), 200, origin);
    }

    if (
      request.method === "GET" &&
      segments.length === 3 &&
      segments[0] === "api" &&
      segments[1] === "cuentas-por-pagar"
    ) {
      try {
        const cuenta = await cuentasContext.cuentasPorPagarService.obtenerCuentaPorPagar(
          segments[2] ?? "",
        );
        return json(cuentaPorPagarResponse(cuenta), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Cuenta por pagar no encontrada" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "POST" && pathname === "/api/cuentas-por-pagar") {
      try {
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<CrearCuentaPorPagarDto>(request);
        const cuenta = await cuentasContext.cuentasPorPagarService.crearCuentaPorPagar(
          dto,
          auth.userId,
        );
        return json(cuentaPorPagarResponse(cuenta), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    if (
      request.method === "POST" &&
      segments.length === 4 &&
      segments[0] === "api" &&
      segments[1] === "cuentas-por-pagar" &&
      segments[3] === "pagos"
    ) {
      try {
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<RegistrarPagoProveedorDto>(request);
        const pago = await cuentasContext.cuentasPorPagarService.registrarPagoProveedor(
          segments[2] ?? "",
          dto,
          auth.userId,
        );
        return json(pagoProveedorResponse(pago), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message.includes("no encontrada") ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "GET" && pathname === "/api/pagos-proveedor") {
      const pagos = await cuentasContext.cuentasPorPagarService.listarPagosProveedor();
      return json(pagos.map(pagoProveedorResponse), 200, origin);
    }

    if (
      request.method === "GET" &&
      segments.length === 3 &&
      segments[0] === "api" &&
      segments[1] === "pagos-proveedor"
    ) {
      try {
        const pago = await cuentasContext.cuentasPorPagarService.obtenerPagoProveedor(
          segments[2] ?? "",
        );
        return json(pagoProveedorResponse(pago), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Pago a proveedor no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    return null;
  };
