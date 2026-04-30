import type { Repository } from "typeorm";
import { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";
import { ArticuloEntitySchema, type ArticuloRow } from "src/infrastructure/persistence/postgres/entities/ArticuloEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: ArticuloRow): Articulo =>
  new Articulo({
    id: row.id,
    itemCode: row.itemCode,
    itemName: row.itemName,
    descripcion: row.descripcion ?? undefined,
    unidadMedida: row.unidadMedida,
    costoEstandar: Number(row.costoEstandar),
    grupoId: row.grupoId,
    impuestoId: row.impuestoId,
    activo: row.activo,
  });

const toRow = (articulo: Articulo): Partial<ArticuloRow> => ({
  id: articulo.props.id,
  itemCode: articulo.props.itemCode,
  itemName: articulo.props.itemName,
  descripcion: articulo.props.descripcion ?? null,
  unidadMedida: articulo.props.unidadMedida,
  costoEstandar: articulo.props.costoEstandar.toFixed(4),
  grupoId: articulo.props.grupoId,
  impuestoId: articulo.props.impuestoId,
  activo: articulo.props.activo,
});

export class ArticuloRepository implements IArticuloRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(articulo: Articulo): Promise<void> {
    await this.repository().save(toRow(articulo));
  }

  public async findById(id: string): Promise<Articulo | null> {
    const row = await this.repository().findOneBy({ id });
    return row ? toDomain(row) : null;
  }

  public async findByItemCode(itemCode: string): Promise<Articulo | null> {
    const row = await this.repository().findOneBy({ itemCode });
    return row ? toDomain(row) : null;
  }

  public async findAll(): Promise<Articulo[]> {
    const rows = await this.repository().find({
      order: {
        itemName: "ASC",
      },
    });

    return rows.map(toDomain);
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.repository().delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private repository(): Repository<ArticuloRow> {
    return this.unitOfWork.getRepository(ArticuloEntitySchema);
  }
}
