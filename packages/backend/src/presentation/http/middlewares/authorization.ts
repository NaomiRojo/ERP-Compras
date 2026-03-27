import { ROLE_IDS, type RoleId, roleCodeFromId } from "src/domain/roles";
import type { AuthContext } from "./auth";

interface RouteAuthorizationRule {
  pathnamePrefix: string;
  methods: readonly string[];
  allowedRoleIds: readonly RoleId[];
}

const routeAuthorizationRules: readonly RouteAuthorizationRule[] = [
  {
    pathnamePrefix: "/api/usuarios",
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN],
  },
  {
    pathnamePrefix: "/api/proveedores",
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: "/api/proveedores",
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: "/api/articulos",
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.ALMACEN, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: "/api/articulos",
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
  {
    pathnamePrefix: "/api/ordenes-compra",
    methods: ["GET"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS, ROLE_IDS.ALMACEN, ROLE_IDS.SUPERVISOR],
  },
  {
    pathnamePrefix: "/api/ordenes-compra",
    methods: ["POST", "PUT", "DELETE"],
    allowedRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.COMPRAS],
  },
];

export const resolveRouteAuthorization = (
  method: string,
  pathname: string,
): RouteAuthorizationRule | null =>
  routeAuthorizationRules.find(
    (rule) => pathname.startsWith(rule.pathnamePrefix) && rule.methods.includes(method),
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
