import type { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";

export interface IRefreshTokenSesionRepository {
  save(token: RefreshTokenSesion): Promise<void>;
  findValidByTokenHash(tokenHash: string): Promise<RefreshTokenSesion | null>;
  revokeById(id: string): Promise<void>;
}
