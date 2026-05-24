import { openApiPaths } from "src/presentation/http/openapiPaths";
import { bearerSecurityScheme, openApiSchemas } from "src/presentation/http/openapiSchemas";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ERP Backend API",
    version: "1.0.0",
    description: "API REST del ERP para autenticacion, proveedores, articulos y ordenes de compra.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Catalogos" },
    { name: "Usuarios" },
    { name: "Proveedores" },
    { name: "Articulos" },
    { name: "OrdenesCompra" },
    { name: "CuentasPorPagar" },
    { name: "PagosProveedor" },
    { name: "Inventario" },
    { name: "Auditoria" },
    { name: "PowerBI" },
  ],
  components: {
    securitySchemes: bearerSecurityScheme,
    schemas: openApiSchemas,
  },
  paths: openApiPaths,
} as const;
