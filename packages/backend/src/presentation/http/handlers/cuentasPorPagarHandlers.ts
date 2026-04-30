import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import type { RegistrarPagoProveedorDto } from "src/application/dtos/cxp/RegistrarPagoProveedorDto";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { json, parseJsonBody } from "src/presentation/http/response";
import {
  cuentaPorPagarResponse,
  pagoProveedorResponse,
} from "src/presentation/http/serializers";
import {
  validateCrearCuentaPorPagarDto,
  validateRegistrarPagoProveedorDto,
} from "src/presentation/http/validators";

type CuentasPorPagarRouteDependencies = Pick<
  HttpDependencies,
  "createCuentasPorPagarContext" | "tokenService"
>;

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

const extractActionItemId = (pathname: string, basePath: string, suffix: string): string | null => {
  const actionPrefix = `${basePath}/`;

  if (!pathname.startsWith(actionPrefix) || !pathname.endsWith(suffix)) {
    return null;
  }

  const id = pathname.slice(actionPrefix.length, pathname.length - suffix.length);
  if (!id || id.includes("/")) {
    return null;
  }

  return id;
};

const resolveCuentasPorPagarStatus = (message: string): number => {
  if (
    message === "Orden de compra no encontrada" ||
    message === "Cuenta por pagar no encontrada" ||
    message === "Pago a proveedor no encontrado"
  ) {
    return 404;
  }

  if (
    message === "Ya existe una cuenta por pagar para esa factura" ||
    message === "La cuenta por pagar no admite mas pagos" ||
    message === "El pago excede el saldo pendiente" ||
    message === "La cuenta por pagar requiere una orden aprobada o recibida" ||
    message === "El proveedor no coincide con la orden de compra"
  ) {
    return 409;
  }

  return 400;
};

export const createCuentasPorPagarRouteHandler =
  ({ createCuentasPorPagarContext, tokenService }: CuentasPorPagarRouteDependencies) =>
  async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method === "GET" && pathname === API_ENDPOINTS.cuentasPorPagar) {
      const context = createCuentasPorPagarContext();
      const cuentas = await context.listarCuentasPorPagarUseCase.execute();
      return json(cuentas.map(cuentaPorPagarResponse), 200, origin);
    }

    const cuentaItemId = extractItemId(pathname, API_ENDPOINTS.cuentasPorPagar);
    if (request.method === "GET" && cuentaItemId) {
      try {
        const context = createCuentasPorPagarContext();
        const cuenta = await context.obtenerCuentaPorPagarUseCase.execute(cuentaItemId);
        return json(cuentaPorPagarResponse(cuenta), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveCuentasPorPagarStatus(message), origin);
      }
    }

    if (request.method === "POST" && pathname === API_ENDPOINTS.cuentasPorPagar) {
      try {
        const context = createCuentasPorPagarContext();
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<CrearCuentaPorPagarDto>(
          request,
          validateCrearCuentaPorPagarDto,
        );
        const cuenta = await context.crearCuentaPorPagarUseCase.execute(dto, auth.userId);
        return json(cuentaPorPagarResponse(cuenta), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveCuentasPorPagarStatus(message), origin);
      }
    }

    const pagoItemId = extractActionItemId(
      pathname,
      API_ENDPOINTS.cuentasPorPagar,
      API_ENDPOINTS.cuentasPorPagarPagosSuffix,
    );
    if (request.method === "POST" && pagoItemId) {
      try {
        const context = createCuentasPorPagarContext();
        const auth = await authenticate(request, tokenService);
        const dto = await parseJsonBody<RegistrarPagoProveedorDto>(
          request,
          validateRegistrarPagoProveedorDto,
        );
        const pago = await context.registrarPagoProveedorUseCase.execute(pagoItemId, dto, auth.userId);
        return json(pagoProveedorResponse(pago), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveCuentasPorPagarStatus(message), origin);
      }
    }

    if (request.method === "GET" && pathname === API_ENDPOINTS.pagosProveedor) {
      const context = createCuentasPorPagarContext();
      const pagos = await context.listarPagosProveedorUseCase.execute();
      return json(pagos.map(pagoProveedorResponse), 200, origin);
    }

    const pagoProveedorItemId = extractItemId(pathname, API_ENDPOINTS.pagosProveedor);
    if (request.method === "GET" && pagoProveedorItemId) {
      try {
        const context = createCuentasPorPagarContext();
        const pago = await context.obtenerPagoProveedorUseCase.execute(pagoProveedorItemId);
        return json(pagoProveedorResponse(pago), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, resolveCuentasPorPagarStatus(message), origin);
      }
    }

    return null;
  };
