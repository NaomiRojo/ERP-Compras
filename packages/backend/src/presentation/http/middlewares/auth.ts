import type { ITokenService } from "src/application/interfaces/ITokenService";
import { isKnownRoleId, roleCodeFromId, type RoleCode, type RoleId } from "src/domain/roles";

export interface AuthContext {
  userId: string;
  email: string;
  roleId: RoleId;
  roleCode: RoleCode;
}

export const authenticate = async (
  request: Request,
  tokenService: ITokenService,
): Promise<AuthContext> => {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("No autorizado");
  }

  const payload = await tokenService.verify(authorization.slice("Bearer ".length));
  const roleId = Number(payload.roleId);
  if (!isKnownRoleId(roleId)) {
    throw new Error("Token invalido");
  }

  return {
    userId: String(payload.sub),
    email: String(payload.email),
    roleId,
    roleCode: roleCodeFromId(roleId) as RoleCode,
  };
};
