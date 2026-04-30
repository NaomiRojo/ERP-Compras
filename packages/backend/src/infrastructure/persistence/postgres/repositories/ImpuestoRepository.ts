import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

export class ImpuestoRepository implements IImpuestoRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findPorcentajeById(id: number): Promise<number | null> {
    const raw = await this.unitOfWork.getEntityManager().query(
      "SELECT porcentaje FROM o_impuestos WHERE id = $1 LIMIT 1",
      [id],
    );

    const porcentaje = raw[0]?.porcentaje;
    return porcentaje == null ? null : Number(porcentaje);
  }
}
