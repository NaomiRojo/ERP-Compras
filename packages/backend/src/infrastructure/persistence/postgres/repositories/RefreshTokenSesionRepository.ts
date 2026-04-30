import type { Repository } from "typeorm";
import { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";
import type { IRefreshTokenSesionRepository } from "src/domain/repositories/IRefreshTokenSesionRepository";
import {
  RefreshTokenSesionEntitySchema,
  type RefreshTokenSesionRow,
} from "src/infrastructure/persistence/postgres/entities/RefreshTokenSesionEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: RefreshTokenSesionRow): RefreshTokenSesion =>
  new RefreshTokenSesion({
    id: row.id,
    usuarioId: row.usuarioId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt ?? undefined,
  });

export class RefreshTokenSesionRepository implements IRefreshTokenSesionRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(token: RefreshTokenSesion): Promise<void> {
    await this.repository().save({
      id: token.props.id,
      usuarioId: token.props.usuarioId,
      tokenHash: token.props.tokenHash,
      expiresAt: token.props.expiresAt,
      revokedAt: token.props.revokedAt ?? null,
    });
  }

  public async findValidByTokenHash(tokenHash: string): Promise<RefreshTokenSesion | null> {
    const row = await this.repository().findOneBy({ tokenHash });
    if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) {
      return null;
    }

    return toDomain(row);
  }

  public async revokeById(id: string): Promise<void> {
    await this.repository().update({ id }, { revokedAt: new Date() });
  }

  private repository(): Repository<RefreshTokenSesionRow> {
    return this.unitOfWork.getRepository(RefreshTokenSesionEntitySchema);
  }
}
