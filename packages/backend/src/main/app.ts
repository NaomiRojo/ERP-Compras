import { container } from "./container";
import { handleArticuloRoutes } from "src/presentation/http/handlers/articuloHandlers";
import { handleAuthRoutes } from "src/presentation/http/handlers/authHandlers";
import { handleOrdenCompraRoutes } from "src/presentation/http/handlers/ordenCompraHandlers";
import { handleProveedorRoutes } from "src/presentation/http/handlers/proveedorHandlers";
import { handleUsuarioRoutes } from "src/presentation/http/handlers/usuarioHandlers";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { openApiDocument } from "src/presentation/http/openapi";
import { corsHeaders, json } from "src/presentation/http/response";

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

const guardProtectedPrefix = async (
  request: Request,
  pathname: string,
  origin: string | null,
): Promise<Response | null> => {
  if (
    pathname.startsWith("/api/usuarios") ||
    pathname.startsWith("/api/proveedores") ||
    pathname.startsWith("/api/articulos") ||
    pathname.startsWith("/api/ordenes-compra")
  ) {
    try {
      await authenticate(request, container.tokenService);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No autorizado";
      return json({ message }, 401, origin);
    }
  }

  return null;
};

export const app = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method === "GET" && pathname === "/health") {
      return json({ status: "ok" }, 200, origin);
    }

    if (request.method === "GET" && pathname === "/openapi.json") {
      return json(openApiDocument, 200, origin);
    }

    if (request.method === "GET" && (pathname === "/docs" || pathname === "/docs/")) {
      return html(swaggerUiHtml);
    }

    if (request.method === "GET" && pathname === "/docs/swagger-ui.css") {
      return swaggerUiAsset("swagger-ui.css");
    }

    if (request.method === "GET" && pathname === "/docs/swagger-ui-bundle.js") {
      return swaggerUiAsset("swagger-ui-bundle.js");
    }

    const authResponse = await handleAuthRoutes(request, pathname, origin, container);
    if (authResponse) {
      return authResponse;
    }

    const guardResponse = await guardProtectedPrefix(request, pathname, origin);
    if (guardResponse) {
      return guardResponse;
    }

    const usuarioResponse = await handleUsuarioRoutes(request, pathname, origin, container);
    if (usuarioResponse) {
      return usuarioResponse;
    }

    const proveedorResponse = await handleProveedorRoutes(request, pathname, origin, container);
    if (proveedorResponse) {
      return proveedorResponse;
    }

    const articuloResponse = await handleArticuloRoutes(request, pathname, origin, container);
    if (articuloResponse) {
      return articuloResponse;
    }

    const ordenCompraResponse = await handleOrdenCompraRoutes(request, pathname, origin, container);
    if (ordenCompraResponse) {
      return ordenCompraResponse;
    }

    return json({ message: "Not found" }, 404, origin);
  },
};
