import { createAuditoriaRouteHandler } from "src/presentation/http/handlers/auditoriaHandlers";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { createArticuloRouteHandler } from "src/presentation/http/handlers/articuloHandlers";
import { createAuthRouteHandler } from "src/presentation/http/handlers/authHandlers";
import { createCatalogoRouteHandler } from "src/presentation/http/handlers/catalogoHandlers";
import { createCuentasPorPagarRouteHandler } from "src/presentation/http/handlers/cuentasPorPagarHandlers";
import { createInventarioRouteHandler } from "src/presentation/http/handlers/inventarioHandlers";
import { createOrdenCompraRouteHandler } from "src/presentation/http/handlers/ordenCompraHandlers";
import { createProveedorRouteHandler } from "src/presentation/http/handlers/proveedorHandlers";
import { createUsuarioRouteHandler } from "src/presentation/http/handlers/usuarioHandlers";
import { SYSTEM_ENDPOINTS } from "src/presentation/http/endpoints";
import { authenticate } from "src/presentation/http/middlewares/auth";
import { authorize, resolveRouteAuthorization } from "src/presentation/http/middlewares/authorization";
import { openApiDocument } from "src/presentation/http/openapi";
import { corsHeaders, isCorsPreflightAllowed, json } from "src/presentation/http/response";

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
    <link rel="stylesheet" href="${SYSTEM_ENDPOINTS.docsCss}" />
    <style>
      html, body { margin: 0; padding: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${SYSTEM_ENDPOINTS.docsBundleJs}"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${SYSTEM_ENDPOINTS.openApi}",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true
      });
    </script>
  </body>
</html>
`;

export const createApp = (dependencies: HttpDependencies) => {
  const handleAuthRoutes = createAuthRouteHandler(dependencies);
  const handleUsuarioRoutes = createUsuarioRouteHandler(dependencies);
  const handleCatalogoRoutes = createCatalogoRouteHandler(dependencies);
  const handleProveedorRoutes = createProveedorRouteHandler(dependencies);
  const handleArticuloRoutes = createArticuloRouteHandler(dependencies);
  const handleOrdenCompraRoutes = createOrdenCompraRouteHandler(dependencies);
  const handleCuentasPorPagarRoutes = createCuentasPorPagarRouteHandler(dependencies);
  const handleInventarioRoutes = createInventarioRouteHandler(dependencies);
  const handleAuditoriaRoutes = createAuditoriaRouteHandler(dependencies);

  const guardProtectedRoute = async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    const routeAuthorization = resolveRouteAuthorization(request.method, pathname);
    if (!routeAuthorization) {
      return null;
    }

    try {
      const authContext = await authenticate(request, dependencies.tokenService);
      authorize(authContext, routeAuthorization.allowedRoleIds);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No autorizado";
      const status = message.includes("no tiene permisos") ? 403 : 401;
      return json({ message }, status, origin);
    }

    return null;
  };

  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const origin = request.headers.get("origin");
      const { pathname } = url;

      if (request.method === "OPTIONS") {
        if (!isCorsPreflightAllowed(request, origin)) {
          return new Response(JSON.stringify({ message: "CORS preflight no permitido" }), {
            status: 403,
            headers: {
              "content-type": "application/json; charset=utf-8",
              vary: "Origin",
            },
          });
        }

        return new Response(null, {
          status: 204,
          headers: corsHeaders(origin),
        });
      }

      if (request.method === "GET" && pathname === SYSTEM_ENDPOINTS.health) {
        return json({ status: "ok" }, 200, origin);
      }

      if (request.method === "GET" && pathname === SYSTEM_ENDPOINTS.ready) {
        const ready = dependencies.isReady ? await dependencies.isReady() : true;
        return json({ status: ready ? "ok" : "degraded" }, ready ? 200 : 503, origin);
      }

      if (request.method === "GET" && pathname === SYSTEM_ENDPOINTS.openApi) {
        return json(openApiDocument, 200, origin);
      }

      if (
        request.method === "GET" &&
        (pathname === SYSTEM_ENDPOINTS.docs || pathname === SYSTEM_ENDPOINTS.docsTrailingSlash)
      ) {
        return html(swaggerUiHtml);
      }

      if (request.method === "GET" && pathname === SYSTEM_ENDPOINTS.docsCss) {
        return swaggerUiAsset("swagger-ui.css");
      }

      if (request.method === "GET" && pathname === SYSTEM_ENDPOINTS.docsBundleJs) {
        return swaggerUiAsset("swagger-ui-bundle.js");
      }

      const authResponse = await handleAuthRoutes(request, pathname, origin);
      if (authResponse) {
        return authResponse;
      }

      const guardResponse = await guardProtectedRoute(request, pathname, origin);
      if (guardResponse) {
        return guardResponse;
      }

      const usuarioResponse = await handleUsuarioRoutes(request, pathname, origin);
      if (usuarioResponse) {
        return usuarioResponse;
      }

      const catalogoResponse = await handleCatalogoRoutes(request, pathname, origin);
      if (catalogoResponse) {
        return catalogoResponse;
      }

      const proveedorResponse = await handleProveedorRoutes(request, pathname, origin);
      if (proveedorResponse) {
        return proveedorResponse;
      }

      const articuloResponse = await handleArticuloRoutes(request, pathname, origin);
      if (articuloResponse) {
        return articuloResponse;
      }

      const ordenCompraResponse = await handleOrdenCompraRoutes(request, pathname, origin);
      if (ordenCompraResponse) {
        return ordenCompraResponse;
      }

      const cuentasPorPagarResponse = await handleCuentasPorPagarRoutes(request, pathname, origin);
      if (cuentasPorPagarResponse) {
        return cuentasPorPagarResponse;
      }

      const inventarioResponse = await handleInventarioRoutes(request, pathname, origin);
      if (inventarioResponse) {
        return inventarioResponse;
      }

      const auditoriaResponse = await handleAuditoriaRoutes(request, pathname, origin);
      if (auditoriaResponse) {
        return auditoriaResponse;
      }

      return json({ message: "Not found" }, 404, origin);
    },
  };
};
