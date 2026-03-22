import type { Repository } from "typeorm";
import { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import {
  CodigoSegundoFactorEntitySchema,
  type CodigoSegundoFactorRow,
} from "src/infrastructure/persistence/postgres/entities/CodigoSegundoFactorEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: CodigoSegundoFactorRow): CodigoSegundoFactor =>
  new CodigoSegundoFactor({
    id: row.id,
    usuarioId: row.usuarioId,
    codigoHash: row.codigoHash,
    canal: row.canal,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt ?? undefined,
  });

export class CodigoSegundoFactorRepository implements ICodigoSegundoFactorRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(codigo: CodigoSegundoFactor): Promise<void> {
    await this.repository().save({
      id: codigo.props.id,
      usuarioId: codigo.props.usuarioId,
      codigoHash: codigo.props.codigoHash,
      canal: codigo.props.canal,
      expiresAt: codigo.props.expiresAt,
      usedAt: codigo.props.usedAt ?? null,
    });
  }

  public async findPendingById(id: string): Promise<CodigoSegundoFactor | null> {
    const row = await this.repository().findOneBy({ id });
    if (!row || row.usedAt) {
      return null;
    }

    return toDomain(row);
  }

  public async markUsed(id: string): Promise<void> {
    await this.repository().update({ id }, { usedAt: new Date() });
  }

  private repository(): Repository<CodigoSegundoFactorRow> {
    return this.unitOfWork.getRepository(CodigoSegundoFactorEntitySchema);
  }
}
