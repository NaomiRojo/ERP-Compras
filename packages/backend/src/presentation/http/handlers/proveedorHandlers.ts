import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { AppContainer } from "src/main/container";
import { json, noContent, parseJsonBody } from "src/presentation/http/response";
import { proveedorResponse } from "src/presentation/http/serializers";

export const handleProveedorRoutes = async (
  request: Request,
  pathname: string,
  origin: string | null,
  container: AppContainer,
): Promise<Response | null> => {
  if (request.method === "GET" && pathname === "/api/proveedores") {
    const proveedorContext = container.createProveedorContext();
    const proveedores = await proveedorContext.listarProveedoresUseCase.execute();
    return json(proveedores.map(proveedorResponse), 200, origin);
  }

  if (request.method === "GET" && pathname.startsWith("/api/proveedores/")) {
    try {
      const proveedorContext = container.createProveedorContext();
      const id = pathname.split("/").at(-1) ?? "";
      const proveedor = await proveedorContext.obtenerProveedorUseCase.execute(id);
      return json(proveedorResponse(proveedor), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 404, origin);
    }
  }

  if (request.method === "POST" && pathname === "/api/proveedores") {
    try {
      const proveedorContext = container.createProveedorContext();
      const dto = await parseJsonBody<CrearProveedorDto>(request);
      const proveedor = await proveedorContext.crearProveedorUseCase.execute(dto);
      return json(proveedorResponse(proveedor), 201, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message.startsWith("Ya existe") || message.includes("obligatorios") ? 400 : 500;
      return json({ message }, status, origin);
    }
  }

  if (request.method === "PUT" && pathname.startsWith("/api/proveedores/")) {
    try {
      const proveedorContext = container.createProveedorContext();
      const id = pathname.split("/").at(-1) ?? "";
      const dto = await parseJsonBody<CrearProveedorDto>(request);
      const proveedor = await proveedorContext.actualizarProveedorUseCase.execute(id, dto);
      return json(proveedorResponse(proveedor), 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message === "Proveedor no encontrado" ? 404 : 400;
      return json({ message }, status, origin);
    }
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/proveedores/")) {
    try {
      const proveedorContext = container.createProveedorContext();
      const id = pathname.split("/").at(-1) ?? "";
      await proveedorContext.eliminarProveedorUseCase.execute(id);
      return noContent(origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      const status = message === "Proveedor no encontrado" ? 404 : 400;
      return json({ message }, status, origin);
    }
  }

  return null;
};
