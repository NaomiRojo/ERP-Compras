import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import type { IArticuloAlmacenRepository } from "src/domain/repositories/IArticuloAlmacenRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: Record<string, unknown>): ArticuloAlmacenStock =>
  new ArticuloAlmacenStock({
    id: String(row.id),
    articuloId: String(row.articulo_id),
    almacenId: String(row.almacen_id),
    stockFisico: Number(row.stock_fisico),
    comprometido: Number(row.comprometido),
    solicitado: Number(row.solicitado),
    stockDisponible: Number(row.stock_disponible),
  });

export class ArticuloAlmacenRepository implements IArticuloAlmacenRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findByArticuloAndAlmacen(
    articuloId: string,
    almacenId: string,
  ): Promise<ArticuloAlmacenStock | null> {
    const rows = await this.query(
      `
        SELECT id, articulo_id, almacen_id, stock_fisico, comprometido, solicitado, stock_disponible
        FROM o_articulo_almacen
        WHERE articulo_id = $1 AND almacen_id = $2
        LIMIT 1
      `,
      [articuloId, almacenId],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async listAll(): Promise<ArticuloAlmacenStock[]> {
    const rows = await this.query(
      `
        SELECT id, articulo_id, almacen_id, stock_fisico, comprometido, solicitado, stock_disponible
        FROM o_articulo_almacen
        ORDER BY almacen_id ASC, articulo_id ASC
      `,
    );

    return rows.map(toDomain);
  }

  public async listByArticuloId(articuloId: string): Promise<ArticuloAlmacenStock[]> {
    const rows = await this.query(
      `
        SELECT id, articulo_id, almacen_id, stock_fisico, comprometido, solicitado, stock_disponible
        FROM o_articulo_almacen
        WHERE articulo_id = $1
        ORDER BY almacen_id ASC
      `,
      [articuloId],
    );

    return rows.map(toDomain);
  }

  public async save(stock: ArticuloAlmacenStock): Promise<void> {
    await this.query(
      `
        INSERT INTO o_articulo_almacen (
          id,
          articulo_id,
          almacen_id,
          stock_fisico,
          comprometido,
          solicitado,
          stock_disponible
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (articulo_id, almacen_id)
        DO UPDATE SET
          stock_fisico = EXCLUDED.stock_fisico,
          comprometido = EXCLUDED.comprometido,
          solicitado = EXCLUDED.solicitado,
          stock_disponible = EXCLUDED.stock_disponible
      `,
      [
        stock.props.id,
        stock.props.articuloId,
        stock.props.almacenId,
        stock.props.stockFisico,
        stock.props.comprometido,
        stock.props.solicitado,
        stock.props.stockDisponible,
      ],
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
