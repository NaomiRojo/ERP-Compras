import type {
  Almacen,
  EstadoDocumento,
  GrupoArticulo,
  Impuesto,
  Moneda,
  RolCatalogo,
  TipoDocumento,
} from "src/domain/entities/Catalogos";
import {
  Almacen as AlmacenEntity,
  EstadoDocumento as EstadoDocumentoEntity,
  GrupoArticulo as GrupoArticuloEntity,
  Impuesto as ImpuestoEntity,
  Moneda as MonedaEntity,
  RolCatalogo as RolCatalogoEntity,
  TipoDocumento as TipoDocumentoEntity,
} from "src/domain/entities/Catalogos";
import type { ICatalogoRepository } from "src/domain/repositories/ICatalogoRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

export class CatalogoRepository implements ICatalogoRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async listRoles(): Promise<RolCatalogo[]> {
    const rows = await this.query(
      "SELECT id, codigo, nombre FROM o_roles ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new RolCatalogoEntity({
          id: Number(row.id),
          codigo: String(row.codigo),
          nombre: String(row.nombre),
        }),
    );
  }

  public async listMonedas(): Promise<Moneda[]> {
    const rows = await this.query(
      "SELECT id, codigo, nombre, tasa_actual FROM o_monedas ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new MonedaEntity({
          id: Number(row.id),
          codigo: String(row.codigo),
          nombre: String(row.nombre),
          tasaActual: Number(row.tasa_actual),
        }),
    );
  }

  public async listImpuestos(): Promise<Impuesto[]> {
    const rows = await this.query(
      "SELECT id, tax_code, nombre, porcentaje, activo FROM o_impuestos ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new ImpuestoEntity({
          id: Number(row.id),
          taxCode: String(row.tax_code),
          nombre: String(row.nombre),
          porcentaje: Number(row.porcentaje),
          activo: Boolean(row.activo),
        }),
    );
  }

  public async listGruposArticulo(): Promise<GrupoArticulo[]> {
    const rows = await this.query(
      "SELECT id, codigo, nombre FROM o_grupos_articulo ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new GrupoArticuloEntity({
          id: Number(row.id),
          codigo: String(row.codigo),
          nombre: String(row.nombre),
        }),
    );
  }

  public async listAlmacenes(): Promise<Almacen[]> {
    const rows = await this.query(
      "SELECT id, nombre, ubicacion, activo FROM o_almacenes ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new AlmacenEntity({
          id: String(row.id),
          nombre: String(row.nombre),
          ubicacion: row.ubicacion == null ? undefined : String(row.ubicacion),
          activo: Boolean(row.activo),
        }),
    );
  }

  public async listEstadosDocumento(): Promise<EstadoDocumento[]> {
    const rows = await this.query(
      "SELECT id, codigo, nombre FROM o_estados_documento ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new EstadoDocumentoEntity({
          id: Number(row.id),
          codigo: String(row.codigo),
          nombre: String(row.nombre),
        }),
    );
  }

  public async listTiposDocumento(): Promise<TipoDocumento[]> {
    const rows = await this.query(
      "SELECT id, codigo, nombre, afecta_inventario FROM o_tipos_documento ORDER BY id ASC",
    );
    return rows.map(
      (row) =>
        new TipoDocumentoEntity({
          id: Number(row.id),
          codigo: String(row.codigo),
          nombre: String(row.nombre),
          afectaInventario: Boolean(row.afecta_inventario),
        }),
    );
  }

  private async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    return this.unitOfWork.getEntityManager().query(sql, params ?? []);
  }
}
