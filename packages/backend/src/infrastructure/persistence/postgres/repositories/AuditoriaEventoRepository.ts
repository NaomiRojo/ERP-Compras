import { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const parseJson = (value: unknown): Record<string, unknown> | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

const toDomain = (row: Record<string, unknown>): AuditoriaEvento =>
  new AuditoriaEvento({
    id: String(row.id),
    usuarioId: String(row.usuario_id),
    entidad: String(row.entidad),
    entidadId: row.entidad_id == null ? undefined : String(row.entidad_id),
    accion: String(row.accion),
    datosAntes: parseJson(row.datos_antes),
    datosDespues: parseJson(row.datos_despues),
    ipOrigen: row.ip_origen == null ? undefined : String(row.ip_origen),
    fecha: new Date(String(row.fecha)),
  });

export class AuditoriaEventoRepository implements IAuditoriaEventoRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async findById(id: string): Promise<AuditoriaEvento | null> {
    const rows = await this.query(
      `
        SELECT id, usuario_id, entidad, entidad_id, accion, datos_antes, datos_despues, ip_origen, fecha
        FROM auditoria_eventos
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? toDomain(rows[0]) : null;
  }

  public async listAll(): Promise<AuditoriaEvento[]> {
    const rows = await this.query(
      `
        SELECT id, usuario_id, entidad, entidad_id, accion, datos_antes, datos_despues, ip_origen, fecha
        FROM auditoria_eventos
        ORDER BY fecha DESC, id DESC
      `,
    );

    return rows.map(toDomain);
  }

  public async save(evento: AuditoriaEvento): Promise<void> {
    await this.query(
      `
        INSERT INTO auditoria_eventos (
          id,
          usuario_id,
          entidad,
          entidad_id,
          accion,
          datos_antes,
          datos_despues,
          ip_origen,
          fecha
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        evento.props.id,
        evento.props.usuarioId,
        evento.props.entidad,
        evento.props.entidadId ?? null,
        evento.props.accion,
        evento.props.datosAntes ? JSON.stringify(evento.props.datosAntes) : null,
        evento.props.datosDespues ? JSON.stringify(evento.props.datosDespues) : null,
        evento.props.ipOrigen ?? null,
        evento.props.fecha.toISOString(),
      ],
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
