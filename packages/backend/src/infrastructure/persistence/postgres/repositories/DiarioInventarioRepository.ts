import { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import type { IDiarioInventarioRepository } from "src/domain/repositories/IDiarioInventarioRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: Record<string, unknown>): DiarioInventarioMovimiento =>
  new DiarioInventarioMovimiento({
    id: String(row.id),
    articuloId: String(row.articulo_id),
    almacenId: String(row.almacen_id),
    docReferenciaId: String(row.doc_referencia_id),
    tipoMovimiento: String(row.tipo_movimiento) as "IN" | "OUT",
    cantidad: Number(row.cantidad),
    costoMomento: Number(row.costo_momento),
    usuarioId: String(row.usuario_id),
    fecha: new Date(String(row.fecha)),
    comentario: row.comentario == null ? undefined : String(row.comentario),
  });

export class DiarioInventarioRepository implements IDiarioInventarioRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findById(id: string): Promise<DiarioInventarioMovimiento | null> {
    const rows = await this.query(
      `
        SELECT id, articulo_id, almacen_id, doc_referencia_id, tipo_movimiento, cantidad,
               costo_momento, usuario_id, fecha, comentario
        FROM diario_inventario
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async listAll(): Promise<DiarioInventarioMovimiento[]> {
    const rows = await this.query(
      `
        SELECT id, articulo_id, almacen_id, doc_referencia_id, tipo_movimiento, cantidad,
               costo_momento, usuario_id, fecha, comentario
        FROM diario_inventario
        ORDER BY fecha DESC, id DESC
      `,
    );

    return rows.map(toDomain);
  }

  public async save(movimiento: DiarioInventarioMovimiento): Promise<void> {
    await this.query(
      `
        INSERT INTO diario_inventario (
          id,
          articulo_id,
          almacen_id,
          doc_referencia_id,
          tipo_movimiento,
          cantidad,
          costo_momento,
          usuario_id,
          fecha,
          comentario
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        movimiento.props.id,
        movimiento.props.articuloId,
        movimiento.props.almacenId,
        movimiento.props.docReferenciaId,
        movimiento.props.tipoMovimiento,
        movimiento.props.cantidad,
        movimiento.props.costoMomento,
        movimiento.props.usuarioId,
        movimiento.props.fecha.toISOString(),
        movimiento.props.comentario ?? null,
      ],
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
