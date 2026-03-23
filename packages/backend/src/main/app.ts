import { container } from "./container";
import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { openApiDocument } from "src/presentation/http/openapi";
import type { Articulo } from "src/domain/entities/Articulo";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { Proveedor } from "src/domain/entities/Proveedor";

const allowedOrigins = (Bun.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsHeaders = (origin: string | null): Record<string, string> => ({
  "access-control-allow-origin": origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-credentials": "true",
  vary: "origin",
});

const json = (body: unknown, status = 200, origin: string | null = null): Response =>
  Response.json(body, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });

const parseJsonBody = async <T>(request: Request): Promise<T> => {
  const body = (await request.json()) as T;
  return body;
};

const html = (body: string): Response =>
  new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });

const swaggerUiAsset = (filename: string): Response =>
  new Response(
    Bun.file(new URL(`../../node_modules/swagger-ui-dist/${filename}`, import.meta.url)),
    {
      headers: {
        "content-type":
          filename.endsWith(".css")
            ? "text/css; charset=utf-8"
            : "application/javascript; charset=utf-8",
      },
    },
  );

const swaggerUiHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ERP API Docs</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
    <style>
      html, body { margin: 0; padding: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true
      });
    </script>
  </body>
</html>
`;

const proveedorResponse = (proveedor: Proveedor) => ({
  id: proveedor.props.id,
  cardCode: proveedor.props.cardCode,
  cardName: proveedor.props.cardName,
  nombreComercial: proveedor.props.nombreComercial,
  nitRut: proveedor.props.nitRut,
  email: proveedor.props.email,
  telefono: proveedor.props.telefono,
  direccion: proveedor.props.direccion,
  monedaId: proveedor.props.monedaId,
  balanceCuenta: proveedor.props.balanceCuenta,
  lineaCredito: proveedor.props.lineaCredito,
  activo: proveedor.props.activo,
});

const articuloResponse = (articulo: Articulo) => ({
  id: articulo.props.id,
  itemCode: articulo.props.itemCode,
  itemName: articulo.props.itemName,
  descripcion: articulo.props.descripcion,
  unidadMedida: articulo.props.unidadMedida,
  costoEstandar: articulo.props.costoEstandar,
  grupoId: articulo.props.grupoId,
  impuestoId: articulo.props.impuestoId,
  activo: articulo.props.activo,
});

const ordenCompraResponse = (ordenCompra: OrdenCompra) => ({
  id: ordenCompra.props.id,
  tipoDocId: ordenCompra.props.tipoDocId,
  docNum: ordenCompra.props.docNum,
  proveedorId: ordenCompra.props.proveedorId,
  estadoId: ordenCompra.props.estadoId,
  monedaId: ordenCompra.props.monedaId,
  fechaDocumento: ordenCompra.props.fechaDocumento,
  fechaVencimiento: ordenCompra.props.fechaVencimiento,
  subtotal: ordenCompra.props.subtotal,
  descuentoTotal: ordenCompra.props.descuentoTotal,
  impuestosTotal: ordenCompra.props.impuestosTotal,
  totalDocumento: ordenCompra.props.totalDocumento,
  comentarios: ordenCompra.props.comentarios,
  detalles: ordenCompra.props.detalles.map((detalle) => ({
    id: detalle.props.id,
    lineNum: detalle.props.lineNum,
    articuloId: detalle.props.articuloId,
    almacenId: detalle.props.almacenId,
    impuestoId: detalle.props.impuestoId,
    descripcion: detalle.props.descripcion,
    cantidadTotal: detalle.props.cantidadTotal,
    cantidadPendiente: detalle.props.cantidadPendiente,
    precioUnitario: detalle.props.precioUnitario,
    descuentoLinea: detalle.props.descuentoLinea,
    subtotalLinea: detalle.props.subtotalLinea,
    totalLinea: detalle.props.totalLinea,
  })),
});

const usuarioResponse = (usuario: {
  props: {
    id: string;
    username: string;
    nombreCompleto: string;
    email: string;
    rolId: number;
    activo: boolean;
    twoFactorEnabled: boolean;
  };
}) => ({
  id: usuario.props.id,
  username: usuario.props.username,
  nombreCompleto: usuario.props.nombreCompleto,
  email: usuario.props.email,
  rolId: usuario.props.rolId,
  activo: usuario.props.activo,
  twoFactorEnabled: usuario.props.twoFactorEnabled,
});

export const app = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok" }, 200, origin);
    }

    if (request.method === "GET" && url.pathname === "/openapi.json") {
      return json(openApiDocument, 200, origin);
    }

    if (request.method === "GET" && (url.pathname === "/docs" || url.pathname === "/docs/")) {
      return html(swaggerUiHtml);
    }

    if (request.method === "GET" && url.pathname === "/docs/swagger-ui.css") {
      return swaggerUiAsset("swagger-ui.css");
    }

    if (request.method === "GET" && url.pathname === "/docs/swagger-ui-bundle.js") {
      return swaggerUiAsset("swagger-ui-bundle.js");
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      try {
        const authContext = container.createAuthContext();
        const dto = await parseJsonBody<RegisterUsuarioDto>(request);
        const usuario = await authContext.registerUsuarioUseCase.execute(dto);

        return json(
          {
            id: usuario.props.id,
            username: usuario.props.username,
            email: usuario.props.email,
            rolId: usuario.props.rolId,
          },
          201,
          origin,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      try {
        const authContext = container.createAuthContext();
        const dto = await parseJsonBody<LoginDto>(request);
        const result = await authContext.loginUsuarioUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/auth/google") {
      try {
        const authContext = container.createAuthContext();
        if (!authContext.loginGoogleUseCase) {
          return json({ message: "Google auth no esta configurado" }, 503, origin);
        }

        const dto = await parseJsonBody<LoginGoogleDto>(request);
        const result = await authContext.loginGoogleUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/auth/verify-2fa") {
      try {
        const authContext = container.createAuthContext();
        const dto = await parseJsonBody<VerifySecondFactorDto>(request);
        const result = await authContext.verifySegundoFactorUseCase.execute(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/auth/refresh") {
      try {
        const authContext = container.createAuthContext();
        const dto = await parseJsonBody<RefreshAccessTokenDto>(request);
        const result = await authContext.verifySegundoFactorUseCase.refresh(dto);
        return json(result, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      try {
        const authContext = container.createAuthContext();
        const auth = await authenticate(request, container.tokenService);
        const usuario = await authContext.usuarioRepository.findById(auth.userId);
        if (!usuario) {
          return json({ message: "Usuario no encontrado" }, 404, origin);
        }

        return json(usuarioResponse(usuario), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        return json({ message }, 401, origin);
      }
    }

    if (url.pathname.startsWith("/api/usuarios")) {
      try {
        await authenticate(request, container.tokenService);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/usuarios") {
      const authContext = container.createAuthContext();
      const usuarios = await authContext.listarUsuariosUseCase.execute();
      return json(usuarios.map(usuarioResponse), 200, origin);
    }

    if (url.pathname.startsWith("/api/proveedores")) {
      try {
        await authenticate(request, container.tokenService);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        return json({ message }, 401, origin);
      }
    }

    if (url.pathname.startsWith("/api/articulos")) {
      try {
        await authenticate(request, container.tokenService);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        return json({ message }, 401, origin);
      }
    }

    if (url.pathname.startsWith("/api/ordenes-compra")) {
      try {
        await authenticate(request, container.tokenService);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No autorizado";
        return json({ message }, 401, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/proveedores") {
      const proveedorContext = container.createProveedorContext();
      const proveedores = await proveedorContext.listarProveedoresUseCase.execute();
      return json(proveedores.map(proveedorResponse), 200, origin);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/proveedores/")) {
      try {
        const proveedorContext = container.createProveedorContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        const proveedor = await proveedorContext.obtenerProveedorUseCase.execute(id);
        return json(proveedorResponse(proveedor), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 404, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/proveedores") {
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

    if (request.method === "PUT" && url.pathname.startsWith("/api/proveedores/")) {
      try {
        const proveedorContext = container.createProveedorContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        const dto = await parseJsonBody<CrearProveedorDto>(request);
        const proveedor = await proveedorContext.actualizarProveedorUseCase.execute(id, dto);
        return json(proveedorResponse(proveedor), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Proveedor no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/api/proveedores/")) {
      try {
        const proveedorContext = container.createProveedorContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        await proveedorContext.eliminarProveedorUseCase.execute(id);
        return new Response(null, {
          status: 204,
          headers: corsHeaders(origin),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Proveedor no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/articulos") {
      const articuloContext = container.createArticuloContext();
      const articulos = await articuloContext.listarArticulosUseCase.execute();
      return json(articulos.map(articuloResponse), 200, origin);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/articulos/")) {
      try {
        const articuloContext = container.createArticuloContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        const articulo = await articuloContext.obtenerArticuloUseCase.execute(id);
        return json(articuloResponse(articulo), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 404, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/articulos") {
      try {
        const articuloContext = container.createArticuloContext();
        const dto = await parseJsonBody<CrearArticuloDto>(request);
        const articulo = await articuloContext.crearArticuloUseCase.execute(dto);
        return json(articuloResponse(articulo), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message.startsWith("Ya existe") || message.includes("obligatorios") ? 400 : 500;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "PUT" && url.pathname.startsWith("/api/articulos/")) {
      try {
        const articuloContext = container.createArticuloContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        const dto = await parseJsonBody<CrearArticuloDto>(request);
        const articulo = await articuloContext.actualizarArticuloUseCase.execute(id, dto);
        return json(articuloResponse(articulo), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Articulo no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/api/articulos/")) {
      try {
        const articuloContext = container.createArticuloContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        await articuloContext.eliminarArticuloUseCase.execute(id);
        return new Response(null, {
          status: 204,
          headers: corsHeaders(origin),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Articulo no encontrado" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/ordenes-compra") {
      const ordenContext = container.createOrdenCompraContext();
      const ordenes = await ordenContext.listarOrdenesCompraUseCase.execute();
      return json(ordenes.map(ordenCompraResponse), 200, origin);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = container.createOrdenCompraContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        const orden = await ordenContext.obtenerOrdenCompraUseCase.execute(id);
        return json(ordenCompraResponse(orden), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 404, origin);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/ordenes-compra") {
      try {
        const ordenContext = container.createOrdenCompraContext();
        const auth = await authenticate(request, container.tokenService);
        const dto = await parseJsonBody<CrearOrdenCompraDto>(request);
        const orden = await ordenContext.crearOrdenCompraUseCase.execute(dto, auth.userId);
        return json(ordenCompraResponse(orden), 201, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        return json({ message }, 400, origin);
      }
    }

    if (request.method === "PUT" && url.pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = container.createOrdenCompraContext();
        const auth = await authenticate(request, container.tokenService);
        const id = url.pathname.split("/").at(-1) ?? "";
        const dto = await parseJsonBody<ActualizarOrdenCompraDto>(request);
        const orden = await ordenContext.actualizarOrdenCompraUseCase.execute(id, dto, auth.userId);
        return json(ordenCompraResponse(orden), 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Orden de compra no encontrada" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/api/ordenes-compra/")) {
      try {
        const ordenContext = container.createOrdenCompraContext();
        const id = url.pathname.split("/").at(-1) ?? "";
        await ordenContext.eliminarOrdenCompraUseCase.execute(id);
        return new Response(null, {
          status: 204,
          headers: corsHeaders(origin),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error interno";
        const status = message === "Orden de compra no encontrada" ? 404 : 400;
        return json({ message }, status, origin);
      }
    }

    return json({ message: "Not found" }, 404, origin);
  },
};
