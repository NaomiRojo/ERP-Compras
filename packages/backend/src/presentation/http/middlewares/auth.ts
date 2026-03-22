import type { ITokenService } from "src/application/interfaces/ITokenService";

export interface AuthContext {
  userId: string;
  email: string;
  roleId: number;
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

  return {
    userId: String(payload.sub),
    email: String(payload.email),
    roleId: Number(payload.roleId),
  };
};
