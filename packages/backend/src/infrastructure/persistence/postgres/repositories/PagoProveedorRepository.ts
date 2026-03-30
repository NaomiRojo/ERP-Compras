import { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { IPagoProveedorRepository } from "src/domain/repositories/IPagoProveedorRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: Record<string, unknown>): PagoProveedor =>
  new PagoProveedor({
    id: String(row.id),
    cuentaPorPagarId: String(row.cuenta_por_pagar_id),
    proveedorId: String(row.proveedor_id),
    monto: Number(row.monto),
    fechaPago: new Date(String(row.fecha_pago)),
    referencia: row.referencia == null ? undefined : String(row.referencia),
    createdBy: String(row.created_by),
  });

export class PagoProveedorRepository implements IPagoProveedorRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findById(id: string): Promise<PagoProveedor | null> {
    const rows = await this.query(
      `
        SELECT id, cuenta_por_pagar_id, proveedor_id, monto, fecha_pago, referencia, created_by
        FROM cxp_pagos_proveedor
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async listAll(): Promise<PagoProveedor[]> {
    const rows = await this.query(
      `
        SELECT id, cuenta_por_pagar_id, proveedor_id, monto, fecha_pago, referencia, created_by
        FROM cxp_pagos_proveedor
        ORDER BY fecha_pago DESC, id DESC
      `,
    );

    return rows.map(toDomain);
  }

  public async save(pago: PagoProveedor): Promise<void> {
    await this.query(
      `
        INSERT INTO cxp_pagos_proveedor (
          id,
          cuenta_por_pagar_id,
          proveedor_id,
          monto,
          fecha_pago,
          referencia,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id)
        DO UPDATE SET
          cuenta_por_pagar_id = EXCLUDED.cuenta_por_pagar_id,
          proveedor_id = EXCLUDED.proveedor_id,
          monto = EXCLUDED.monto,
          fecha_pago = EXCLUDED.fecha_pago,
          referencia = EXCLUDED.referencia,
          created_by = EXCLUDED.created_by
      `,
      [
        pago.props.id,
        pago.props.cuentaPorPagarId,
        pago.props.proveedorId,
        pago.props.monto,
        pago.props.fechaPago.toISOString(),
        pago.props.referencia ?? null,
        pago.props.createdBy,
      ],
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
