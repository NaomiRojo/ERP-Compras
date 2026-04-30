import { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { ICuentaPorPagarRepository } from "src/domain/repositories/ICuentaPorPagarRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: Record<string, unknown>): CuentaPorPagar =>
  new CuentaPorPagar({
    id: String(row.id),
    compraId: String(row.compra_id),
    proveedorId: String(row.proveedor_id),
    numeroFactura: String(row.numero_factura),
    montoTotal: Number(row.monto_total),
    saldoPendiente: Number(row.saldo_pendiente),
    fechaVencimiento: new Date(String(row.fecha_vencimiento)),
    estado: String(row.estado) as "PENDIENTE" | "PARCIAL" | "PAGADA" | "ANULADA",
  });

export class CuentaPorPagarRepository implements ICuentaPorPagarRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findById(id: string): Promise<CuentaPorPagar | null> {
    const rows = await this.query(
      `
        SELECT id, compra_id, proveedor_id, numero_factura, monto_total, saldo_pendiente,
               fecha_vencimiento, estado
        FROM cxp_cuentas_por_pagar
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async findByProveedorAndNumeroFactura(
    proveedorId: string,
    numeroFactura: string,
  ): Promise<CuentaPorPagar | null> {
    const rows = await this.query(
      `
        SELECT id, compra_id, proveedor_id, numero_factura, monto_total, saldo_pendiente,
               fecha_vencimiento, estado
        FROM cxp_cuentas_por_pagar
        WHERE proveedor_id = $1 AND numero_factura = $2
        LIMIT 1
      `,
      [proveedorId, numeroFactura],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async listAll(): Promise<CuentaPorPagar[]> {
    const rows = await this.query(
      `
        SELECT id, compra_id, proveedor_id, numero_factura, monto_total, saldo_pendiente,
               fecha_vencimiento, estado
        FROM cxp_cuentas_por_pagar
        ORDER BY fecha_vencimiento ASC, id ASC
      `,
    );

    return rows.map(toDomain);
  }

  public async save(cuentaPorPagar: CuentaPorPagar): Promise<void> {
    await this.query(
      `
        INSERT INTO cxp_cuentas_por_pagar (
          id,
          compra_id,
          proveedor_id,
          numero_factura,
          monto_total,
          saldo_pendiente,
          fecha_vencimiento,
          estado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id)
        DO UPDATE SET
          compra_id = EXCLUDED.compra_id,
          proveedor_id = EXCLUDED.proveedor_id,
          numero_factura = EXCLUDED.numero_factura,
          monto_total = EXCLUDED.monto_total,
          saldo_pendiente = EXCLUDED.saldo_pendiente,
          fecha_vencimiento = EXCLUDED.fecha_vencimiento,
          estado = EXCLUDED.estado,
          updated_at = NOW()
      `,
      [
        cuentaPorPagar.props.id,
        cuentaPorPagar.props.compraId,
        cuentaPorPagar.props.proveedorId,
        cuentaPorPagar.props.numeroFactura,
        cuentaPorPagar.props.montoTotal,
        cuentaPorPagar.props.saldoPendiente,
        cuentaPorPagar.props.fechaVencimiento.toISOString().slice(0, 10),
        cuentaPorPagar.props.estado,
      ],
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
