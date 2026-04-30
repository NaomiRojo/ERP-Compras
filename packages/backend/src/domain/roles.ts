  export const ROLE_IDS = {
    ADMIN: 1,
    COMPRAS: 2,
    ALMACEN: 3,
    SUPERVISOR: 4,
  } as const;

  export type RoleCode = keyof typeof ROLE_IDS;
  export type RoleId = (typeof ROLE_IDS)[RoleCode];

  const ROLE_CODES_BY_ID: Record<RoleId, RoleCode> = {
    [ROLE_IDS.ADMIN]: "ADMIN",
    [ROLE_IDS.COMPRAS]: "COMPRAS",
    [ROLE_IDS.ALMACEN]: "ALMACEN",
    [ROLE_IDS.SUPERVISOR]: "SUPERVISOR",
  };

  export const roleCodeFromId = (roleId: number): RoleCode | null =>
    ROLE_CODES_BY_ID[roleId as RoleId] ?? null;

  export const isKnownRoleId = (roleId: number): roleId is RoleId =>
    roleCodeFromId(roleId) !== null;
