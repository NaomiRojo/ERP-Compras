import type { Repository } from "typeorm";
import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";
import { Proveedor } from "src/domain/entities/Proveedor";
import { ProveedorEntitySchema, type ProveedorRow } from "src/infrastructure/persistence/postgres/entities/ProveedorEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: ProveedorRow): Proveedor =>
  new Proveedor({
    id: row.id,
    cardCode: row.cardCode,
    cardName: row.cardName,
    nombreComercial: row.nombreComercial ?? undefined,
    nitRut: row.nitRut,
    email: row.email ?? undefined,
    telefono: row.telefono ?? undefined,
    direccion: row.direccion ?? undefined,
    monedaId: row.monedaId,
    balanceCuenta: Number(row.balanceCuenta),
    lineaCredito: Number(row.lineaCredito),
    activo: row.activo,
  });

const toPersistence = (proveedor: Proveedor): Partial<ProveedorRow> => ({
  id: proveedor.props.id,
  cardCode: proveedor.props.cardCode,
  cardName: proveedor.props.cardName,
  nombreComercial: proveedor.props.nombreComercial ?? null,
  nitRut: proveedor.props.nitRut,
  email: proveedor.props.email ?? null,
  telefono: proveedor.props.telefono ?? null,
  direccion: proveedor.props.direccion ?? null,
  monedaId: proveedor.props.monedaId,
  balanceCuenta: proveedor.props.balanceCuenta.toFixed(2),
  lineaCredito: proveedor.props.lineaCredito.toFixed(2),
  activo: proveedor.props.activo,
});

export class ProveedorRepository implements IProveedorRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(proveedor: Proveedor): Promise<void> {
    await this.repository().save(toPersistence(proveedor));
  }

  public async findById(id: string): Promise<Proveedor | null> {
    const row = await this.repository().findOneBy({ id });
    return row ? toDomain(row) : null;
  }

  public async findByCardCode(cardCode: string): Promise<Proveedor | null> {
    const row = await this.repository().findOneBy({ cardCode });
    return row ? toDomain(row) : null;
  }

  public async findByNitRut(nitRut: string): Promise<Proveedor | null> {
    const row = await this.repository().findOneBy({ nitRut });
    return row ? toDomain(row) : null;
  }

  public async findAll(): Promise<Proveedor[]> {
    const rows = await this.repository().find({
      order: {
        cardName: "ASC",
      },
    });

    return rows.map(toDomain);
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.repository().delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private repository(): Repository<ProveedorRow> {
    return this.unitOfWork.getRepository(ProveedorEntitySchema);
  }
}
