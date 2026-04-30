import { ROLE_IDS, type RoleId, roleCodeFromId } from "src/domain/roles";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import type { AuthContext } from "./auth";

interface RouteAuthorizationRule {
  pathnamePrefix: string;
  pathnameSuffix?: string;
  methods: readonly string[];
  allowedRoleIds: readonly RoleId[];
}

const readOnlyRoleIds = [
  ROLE_IDS.ADMIN,
  ROLE_IDS.COMPRAS,
  ROLE_IDS.ALMACEN,
  ROLE_IDS.SUPERVISOR,
] as const;

const routeAuthorizationRules: readonly RouteAuthorizationRule[] = [
  {
    pathnamePrefix: API_ENDPOINTS.usuarios,
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN],
  },
  {
    pathnamePrefix: API_ENDPOINTS.proveedores,
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: API_ENDPOINTS.proveedores,
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: API_ENDPOINTS.articulos,
    methods: ["GET"],
    allowedRoleIds: readOnlyRoleIds,
  },
  {
    pathnamePrefix: API_ENDPOINTS.articulos,
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: API_ENDPOINTS.ordenesCompra,
    methods: ["GET"],
    allowedRoleIds: readOnlyRoleIds,
  },
  {
    pathnamePrefix: `${API_ENDPOINTS.ordenesCompra}/`,
    pathnameSuffix: API_ENDPOINTS.ordenesCompraApproveSuffix,
    methods: ["POST"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: `${API_ENDPOINTS.ordenesCompra}/`,
    pathnameSuffix: API_ENDPOINTS.ordenesCompraRecepcionesSuffix,
    methods: ["POST"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.ALMACEN],
  },
  {
    pathnamePrefix: API_ENDPOINTS.cuentasPorPagar,
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: `${API_ENDPOINTS.cuentasPorPagar}/`,
    pathnameSuffix: API_ENDPOINTS.cuentasPorPagarPagosSuffix,
    methods: ["POST"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: API_ENDPOINTS.cuentasPorPagar,
    methods: ["POST"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: API_ENDPOINTS.pagosProveedor,
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: API_ENDPOINTS.inventario.stocks,
    methods: ["GET"],
    allowedRoleIds: readOnlyRoleIds,
  },
  {
    pathnamePrefix: API_ENDPOINTS.inventario.movimientos,
    methods: ["GET"],
    allowedRoleIds: readOnlyRoleIds,
  },
  {
    pathnamePrefix: API_ENDPOINTS.auditoria,
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: API_ENDPOINTS.catalogos.base,
    methods: ["GET"],
    allowedRoleIds: readOnlyRoleIds,
  },
  {
    pathnamePrefix: API_ENDPOINTS.ordenesCompra,
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
];

export const resolveRouteAuthorization = (
  method: string,
  pathname: string,
): RouteAuthorizationRule | null =>
  routeAuthorizationRules.find(
    (rule) =>
      pathname.startsWith(rule.pathnamePrefix) &&
      (!rule.pathnameSuffix || pathname.endsWith(rule.pathnameSuffix)) &&
      rule.methods.includes(method),
  ) ?? null;

export const authorize = (
  authContext: AuthContext,
  allowedRoleIds: readonly RoleId[],
): void => {
  if (allowedRoleIds.includes(authContext.roleId as RoleId)) {
    return;
  }

  const roleCode = roleCodeFromId(authContext.roleId);
  throw new Error(
    roleCode
      ? `El rol ${roleCode} no tiene permisos para esta accion`
      : "El rol actual no tiene permisos para esta accion",
  );
};
